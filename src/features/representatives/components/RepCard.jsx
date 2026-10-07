/* =====================================================================
 *  REPRESENTATIVE CARDS  (photo, name, call / WhatsApp / Facebook buttons)
 *  Edit this file to change how a representative looks on the website.
 * ===================================================================== */
import { useEffect, useState } from 'react'
import { Phone, MessageCircle, Facebook, MapPin, UserPlus, Mail, CalendarDays } from 'lucide-react'
import { SITE, NETWORK } from '../../../config/site'
import { Modal } from '../../../components/ui'
import { getPhoto } from '../lib/service'
import { telHref, waHref } from '../lib/logic'

// Shown when a representative has no photo
export function DefaultAvatar({ size = 88 }) {
  return (
    <div style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-chalk ring-2 ring-white">
      <img src={SITE.logo.src} alt="" style={{ height: size * 0.72 }} className="w-auto opacity-80" />
    </div>
  )
}

export function Avatar({ rep, size = 88, src, ring = 'ring-2 ring-white' }) {
  const s = src || rep?.thumb
  if (!s) return <DefaultAvatar size={size} />
  return <img src={s} alt={rep.name} style={{ width: size, height: size }} className={`shrink-0 rounded-full object-cover ${ring}`} loading="lazy" />
}

const Btn = ({ href, icon: Icon, children, tone = 'ink' }) => (
  <a
    href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener"
    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
      tone === 'wa' ? 'bg-[#25D366] text-white hover:brightness-95' : tone === 'volt' ? 'bg-volt text-ink hover:bg-volt-dim' : 'bg-ink text-paper hover:bg-graphite'
    }`}
  ><Icon size={14} /> {children}</a>
)

export function ContactButtons({ rep, stack = false }) {
  const fb = rep.facebook_url
  return (
    <div className={stack ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
      <Btn href={telHref(rep.mobile)} icon={Phone}>Call</Btn>
      {waHref(rep.whatsapp || rep.mobile) && <Btn href={waHref(rep.whatsapp || rep.mobile, `Hi ${rep.name}, I found you on ${SITE.name}.`)} icon={MessageCircle} tone="wa">WhatsApp</Btn>}
      {fb && <Btn href={fb} icon={Facebook} tone="volt">Facebook</Btn>}
    </div>
  )
}

/* ---------- a representative ---------- */
export function RepCard({ rep, place, onOpen }) {
  return (
    <div className="card flex flex-col items-center p-5 text-center">
      <Avatar rep={rep} size={96} />
      <h4 className="mt-3 text-lg font-black leading-tight">{rep.name}</h4>
      <p className="text-xs font-bold uppercase tracking-wide text-ink/50">{rep.designation || NETWORK.publicLabel}</p>
      {place && <p className="mt-2 flex items-center gap-1 text-sm text-ink/70"><MapPin size={14} /> {place}</p>}
      <p className="mt-2 font-mono text-sm font-semibold">{rep.mobile}</p>
      <div className="mt-4 w-full"><ContactButtons rep={rep} /></div>
      {onOpen && <button onClick={onOpen} className="mt-3 text-xs font-bold uppercase tracking-wide text-ink/50 underline-offset-4 hover:text-ink hover:underline">View profile</button>}
    </div>
  )
}

/* ---------- wide version, used inside the tree (photo left · details middle · buttons right) ---------- */
export function RepCardWide({ rep, place, onOpen }) {
  return (
    <div className="card flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:gap-6 sm:text-left">
      <Avatar rep={rep} size={112} ring="ring-4 ring-volt" />
      <div className="min-w-0 flex-1">
        <span className="inline-block rounded-full bg-chalk px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink/60">{rep.designation || NETWORK.publicLabel}</span>
        <h4 className="mt-2 text-2xl font-black leading-tight">{rep.name}</h4>
        {place && <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-ink/70 sm:justify-start"><MapPin size={15} /> {place}</p>}
        <p className="mt-2 flex items-center justify-center gap-1.5 font-mono text-base font-bold sm:justify-start"><Phone size={15} className="text-ink/40" /> {rep.mobile}</p>
        {rep.bio && <p className="mt-2 line-clamp-2 text-sm text-ink/60">{rep.bio}</p>}
      </div>
      <div className="w-full shrink-0 sm:w-48">
        <ContactButtons rep={rep} stack />
        {onOpen && <button onClick={onOpen} className="mt-2 w-full text-center text-xs font-bold uppercase tracking-wide text-ink/50 hover:text-ink">View profile</button>}
      </div>
    </div>
  )
}

/* ---------- an area with nobody assigned (never a broken / empty card) ---------- */
// compact = narrow vertical card (used in search results grid); default = wide row (used in the tree)
export function VacantCard({ place, compact = false }) {
  const text = encodeURIComponent(`Hi ${SITE.name}! I'm interested in becoming the representative for ${place || 'my area'}.`)
  return (
    <div className={`flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ink/25 bg-chalk/60 p-5 text-center ${compact ? 'justify-center' : 'sm:flex-row sm:text-left'}`}>
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-flare shadow-sm"><UserPlus size={26} /></div>
      <div className={compact ? '' : 'flex-1'}>
        <h4 className="text-lg font-black">{NETWORK.vacantEn}</h4>
        <p className="text-sm text-ink/60">{NETWORK.vacantBn}</p>
      </div>
      <a href={`https://wa.me/${SITE.contact.whatsapp}?text=${text}`} target="_blank" rel="noreferrer noopener" className="btn-ink shrink-0 whitespace-nowrap px-5 py-2.5 text-xs">Become a representative</a>
    </div>
  )
}

/* ---------- full profile (opens when you press “View profile”) ---------- */
export function RepProfileModal({ rep, place, onClose }) {
  const [photo, setPhoto] = useState('')
  useEffect(() => {
    let alive = true
    setPhoto('')
    if (rep) getPhoto(rep.id).then((p) => alive && setPhoto(p)).catch(() => {})
    return () => { alive = false }
  }, [rep])
  if (!rep) return null
  return (
    <Modal open onClose={onClose} title={rep.name}>
      <div className="flex flex-col items-center text-center">
        <Avatar rep={rep} size={140} src={photo || rep.thumb} />
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-ink/50">{rep.designation || NETWORK.publicLabel}</p>
        {place && <p className="mt-1 flex items-center gap-1 text-sm text-ink/70"><MapPin size={14} /> {place}</p>}
        {rep.bio && <p className="mt-4 text-sm leading-relaxed text-ink/70">{rep.bio}</p>}
        <dl className="mt-4 w-full space-y-2 text-left text-sm">
          <div className="flex items-center gap-2"><Phone size={15} className="text-ink/40" /> <a href={telHref(rep.mobile)} className="font-mono font-semibold">{rep.mobile}</a></div>
          {rep.email && <div className="flex items-center gap-2"><Mail size={15} className="text-ink/40" /> <a href={`mailto:${rep.email}`} className="break-all">{rep.email}</a></div>}
          {rep.address && <div className="flex items-center gap-2"><MapPin size={15} className="text-ink/40" /> {rep.address}</div>}
          {rep.joining_date && <div className="flex items-center gap-2"><CalendarDays size={15} className="text-ink/40" /> With {SITE.name} since {rep.joining_date}</div>}
        </dl>
        <div className="mt-5 w-full"><ContactButtons rep={rep} /></div>
      </div>
    </Modal>
  )
}
