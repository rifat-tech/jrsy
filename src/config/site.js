/* =====================================================================
 *  SITE SETTINGS  —  the ONE place for brand name, logo and contact info
 *  Edit the values below; the whole website updates.
 * ===================================================================== */

export const SITE = {
  name: 'SPORTY',
  tagline: 'Play. Wear. Repeat.',

  // ---- LOGO ------------------------------------------------------------
  // To change the logo: replace the file  public/logo.png  (keep the name),
  // or point `src` to another file in the public/ folder.
  // Heights are in pixels. Make a number bigger/smaller to resize the logo.
  logo: {
    src: '/logo.png',
    alt: 'SPORTY',
    height: {
      header: 58,   // top menu bar (the bar itself is 72px tall)
      footer: 96,   // bottom of every page
      auth: 96,     // login / register pages
      admin: 60,    // admin panel sidebar
    },
  },

  // ---- CONTACT (used by the green WhatsApp / call buttons) ---------------
  contact: {
    phoneDisplay: '01515282978',
    phoneDial: '+8801515282978',
    whatsapp: '8801515282978', // 880 + number without the leading 0
  },
}

/* =====================================================================
 *  REPRESENTATIVE NETWORK SETTINGS  (public page: /sporty-representatives)
 * ===================================================================== */
export const NETWORK = {
  titleEn: 'Sporty Bangladesh Representative Network',
  titleBn: 'স্পোর্টি বাংলাদেশ প্রতিনিধি নেটওয়ার্ক',
  subtitleEn: 'Your Local Sporty Representative, Everywhere in Bangladesh.',
  subtitleBn: 'বাংলাদেশের প্রতিটি অঞ্চলে স্পোর্টির প্রতিনিধি',
  heroLineEn: 'Find your nearest Sporty representative.',
  heroLineBn: 'আপনার এলাকার স্পোর্টি প্রতিনিধিকে খুঁজে নিন।',
  vacantEn: 'Representative Needed',
  vacantBn: 'এই এলাকায় প্রতিনিধি নিয়োগ দেওয়া হবে',

  // Text shown on public cards. (Internally each record also has a `type`.)
  publicLabel: 'Sporty Representative',

  // RULE: how many ACTIVE representatives one upazila may have.
  // 1 = one per upazila (default). Change to 2, 3... later if Sporty wants more.
  maxActivePerUpazila: 1,

  // Representative types (for future growth). Only the first is shown publicly for now.
  types: ['Area Representative', 'Sales Representative', 'Dealer', 'Distributor', 'Retail Partner', 'Corporate Representative'],
  defaultType: 'Area Representative',
  defaultDesignation: 'Sporty Representative',

  // Public web address of the page
  basePath: '/sporty-representatives',
}
