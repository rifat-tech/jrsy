/* =====================================================================
 *  FORM CHECKS for representatives (used by the admin form + the service)
 *  Change limits / rules here.
 * ===================================================================== */
import { NETWORK } from '../../../config/site'
import { bdPhone } from './logic'

const STATUSES = ['active', 'inactive']
// eslint-disable-next-line no-control-regex
const CTRL = /[\u0000-\u001F\u007F]/g
const clean = (s = '', max = 200) => String(s ?? '').replace(CTRL, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
const FB = /^https:\/\/((www|m|web|mbasic)\.)?(facebook\.com|fb\.com|fb\.me)\/[^\s<>"']+$/i
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_MB = 8

export function validateImageFile(file) {
  if (!file) return ''
  if (!IMAGE_TYPES.includes(file.type)) return 'Photo must be a JPG, PNG or WebP image.'
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `Photo is too large (max ${MAX_IMAGE_MB} MB).`
  return ''
}

export function validateRep(input) {
  const errors = {}
  const v = {
    name: clean(input.name, 80),
    designation: clean(input.designation, 60) || NETWORK.defaultDesignation,
    representative_type: NETWORK.types.includes(input.representative_type) ? input.representative_type : NETWORK.defaultType,
    mobile: clean(input.mobile, 20),
    whatsapp: clean(input.whatsapp, 20),
    email: clean(input.email, 100).toLowerCase(),
    facebook_url: clean(input.facebook_url, 300),
    address: clean(input.address, 200),
    bio: clean(input.bio, 500),
    division_id: clean(input.division_id, 40),
    district_id: clean(input.district_id, 40),
    upazila_id: clean(input.upazila_id, 40),
    status: STATUSES.includes(input.status) ? input.status : 'active',
    joining_date: /^\d{4}-\d{2}-\d{2}$/.test(input.joining_date || '') ? input.joining_date : '',
  }
  if (v.name.length < 2) errors.name = 'Please enter the representative’s name.'
  const m = bdPhone(v.mobile)
  if (!m) errors.mobile = 'Enter a valid Bangladesh mobile number (01XXXXXXXXX).'
  else v.mobile = m.local
  if (v.whatsapp) {
    const w = bdPhone(v.whatsapp)
    if (!w) errors.whatsapp = 'WhatsApp number is not valid.'
    else v.whatsapp = w.local
  }
  if (v.email && !EMAIL.test(v.email)) errors.email = 'Email address is not valid.'
  if (v.facebook_url && !FB.test(v.facebook_url)) errors.facebook_url = 'Use a full Facebook link starting with https://facebook.com/…'
  if (!v.division_id) errors.division_id = 'Select a division.'
  if (!v.district_id) errors.district_id = 'Select a district.'
  if (!v.upazila_id) errors.upazila_id = 'Select an upazila.'
  return { ok: Object.keys(errors).length === 0, errors, value: v }
}
