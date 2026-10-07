/* =====================================================================
 *  NETWORK LOGIC (pure functions — no screens here)
 *  Build the tree, count coverage, search & filter.
 *  Everything is calculated from the database; nothing is typed in by hand.
 * ===================================================================== */
import { NETWORK } from '../../../config/site'

/* ---------- text helpers (work for Bangla + English) ---------- */
const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
export const toAsciiDigits = (s = '') => String(s).replace(/[০-৯]/g, (d) => BN_DIGITS.indexOf(d))
export const norm = (s = '') => toAsciiDigits(s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()
export const digitsOnly = (s = '') => toAsciiDigits(s).replace(/\D/g, '')
export const slugify = (s = '') =>
  String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Official / common modern English spellings (the dataset may use older ones). Edit freely.
const EN_FIX = {
  Chittagong: 'Chattogram', Comilla: 'Cumilla', Barisal: 'Barishal', Bogra: 'Bogura', Jessore: 'Jashore',
  Jhalokati: 'Jhalakathi',
}
const fixEn = (n = '') => EN_FIX[n.trim()] || n.trim()

/* ---------- convert the raw open dataset into our database documents ---------- */
export function buildLocationDocs(rawDivisions = [], rawDistricts = [], rawUpazilas = []) {
  const pick = (r) => ({ en: fixEn(r.name || r.name_en || r.en_name || ''), bn: (r.bn_name || r.name_bn || r.bnName || '').trim() })
  const divisions = rawDivisions.map((r) => {
    const n = pick(r)
    return { id: `div_${r.id}`, name_bn: n.bn, name_en: n.en, slug: slugify(n.en), status: 'active' }
  })
  const districts = rawDistricts.map((r) => {
    const n = pick(r)
    return { id: `dis_${r.id}`, division_id: `div_${r.division_id}`, name_bn: n.bn, name_en: n.en, slug: slugify(n.en), status: 'active' }
  })
  const divOfDistrict = new Map(districts.map((d) => [d.id, d.division_id]))
  const used = new Set()
  const upazilas = rawUpazilas.map((r) => {
    const n = pick(r)
    const district_id = `dis_${r.district_id}`
    let slug = slugify(n.en) || `upazila-${r.id}`
    if (used.has(`${district_id}/${slug}`)) slug = `${slug}-${r.id}`
    used.add(`${district_id}/${slug}`)
    return { id: `upa_${r.id}`, division_id: divOfDistrict.get(district_id) || '', district_id, name_bn: n.bn, name_en: n.en, slug, status: 'active' }
  })
  return { divisions, districts, upazilas }
}

/* ---------- build lookup tables + the tree ---------- */
export function buildIndex({ divisions = [], districts = [], upazilas = [], reps = [] }) {
  const live = (a) => a.status !== 'inactive'
  const divs = divisions.filter(live)
  const diss = districts.filter(live)
  const upas = upazilas.filter(live)

  const divById = new Map(divs.map((d) => [d.id, d]))
  const disById = new Map(diss.map((d) => [d.id, d]))
  const upaById = new Map(upas.map((u) => [u.id, u]))

  const repsByUpa = new Map()
  reps.forEach((r) => {
    if (!repsByUpa.has(r.upazila_id)) repsByUpa.set(r.upazila_id, [])
    repsByUpa.get(r.upazila_id).push(r)
  })
  const activeOf = (upaId) => (repsByUpa.get(upaId) || []).filter((r) => r.status === 'active')

  const byName = (a, b) => (a.name_en || '').localeCompare(b.name_en || '')
  const upasByDis = new Map(); const disByDiv = new Map()
  upas.forEach((u) => { if (!upasByDis.has(u.district_id)) upasByDis.set(u.district_id, []); upasByDis.get(u.district_id).push(u) })
  diss.forEach((d) => { if (!disByDiv.has(d.division_id)) disByDiv.set(d.division_id, []); disByDiv.get(d.division_id).push(d) })
  upasByDis.forEach((l) => l.sort(byName)); disByDiv.forEach((l) => l.sort(byName))
  divs.sort(byName)

  const idx = { divs, diss, upas, reps, divById, disById, upaById, repsByUpa, activeOf, upasByDis, disByDiv }
  idx.coverage = (list) => {
    const total = list.length
    const covered = list.filter((u) => activeOf(u.id).length > 0).length
    return { total, covered, vacant: total - covered, pct: total ? Math.round((covered / total) * 100) : 0 }
  }
  return idx
}

export const upazilasOfDistrict = (idx, id) => idx.upasByDis.get(id) || []
export const districtsOfDivision = (idx, id) => idx.disByDiv.get(id) || []
export const upazilasOfDivision = (idx, id) => districtsOfDivision(idx, id).flatMap((d) => upazilasOfDistrict(idx, d.id))

/* ---------- numbers for the stats strip + admin dashboard ---------- */
export function computeStats(idx) {
  const cov = idx.coverage(idx.upas)
  return {
    divisions: idx.divs.length,
    districts: idx.diss.length,
    upazilas: idx.upas.length,
    activeReps: idx.reps.filter((r) => r.status === 'active').length,
    inactiveReps: idx.reps.filter((r) => r.status === 'inactive').length,
    covered: cov.covered, vacant: cov.vacant, coveragePct: cov.pct,
  }
}

export function coverageByDivision(idx) {
  return idx.divs.map((d) => ({ division: d, ...idx.coverage(upazilasOfDivision(idx, d.id)) }))
}

/* ---------- one row = one upazila + its place in the tree + its reps ---------- */
export function rowFor(idx, u) {
  const district = idx.disById.get(u.district_id)
  const division = idx.divById.get(district?.division_id)
  const reps = idx.repsByUpa.get(u.id) || []
  return { upazila: u, district, division, reps, active: reps.filter((r) => r.status === 'active') }
}

/* ---------- SEARCH + FILTERS ----------
 * query: free text (Bangla or English): division / district / upazila / rep name / mobile
 * filters: { divisionId, districtId, upazilaId, status: 'all'|'active'|'inactive'|'vacant' }  */
export function searchAreas(idx, query = '', filters = {}) {
  const { divisionId = '', districtId = '', upazilaId = '', status = 'all' } = filters
  const tokens = norm(query).split(' ').filter(Boolean)
  const out = []
  for (const u of idx.upas) {
    if (upazilaId && u.id !== upazilaId) continue
    if (districtId && u.district_id !== districtId) continue
    const row = rowFor(idx, u)
    if (!row.district || !row.division) continue
    if (divisionId && row.division.id !== divisionId) continue
    if (status === 'active' && !row.active.length) continue
    if (status === 'vacant' && row.active.length) continue
    if (status === 'inactive' && !row.reps.some((r) => r.status === 'inactive')) continue
    let score = 0
    if (tokens.length) {
      const own = norm(`${u.name_bn} ${u.name_en}`)
      const hay = norm([
        u.name_bn, u.name_en, row.district.name_bn, row.district.name_en, row.division.name_bn, row.division.name_en,
        ...row.reps.map((r) => `${r.name} ${digitsOnly(r.mobile)} ${digitsOnly(r.whatsapp || '')}`),
      ].join(' '))
      if (!tokens.every((t) => hay.includes(t))) continue
      score = tokens.reduce((s, t) => s + (own.includes(t) ? 2 : 0), 0) + (row.active.length ? 1 : 0)
    }
    out.push({ ...row, score })
  }
  return out.sort((a, b) => b.score - a.score || (a.upazila.name_en || '').localeCompare(b.upazila.name_en || ''))
}

/* ---------- URLs: /sporty-representatives/dhaka/dhaka/savar ---------- */
export const areaUrl = (div, dis, upa) =>
  [NETWORK.basePath, div?.slug, dis?.slug, upa?.slug].filter(Boolean).join('/')

/* ---------- phone helpers (Bangladesh numbers) ---------- */
export function bdPhone(raw = '') {
  let d = digitsOnly(raw)
  if (d.startsWith('880')) d = d.slice(3)
  if (d.startsWith('0')) d = d.slice(1)
  return d.length === 10 && d.startsWith('1') ? { local: `0${d}`, intl: `880${d}` } : null
}
export const telHref = (raw) => (bdPhone(raw) ? `tel:+${bdPhone(raw).intl}` : '')
export const waHref = (raw, text = '') =>
  bdPhone(raw) ? `https://wa.me/${bdPhone(raw).intl}${text ? `?text=${encodeURIComponent(text)}` : ''}` : ''
