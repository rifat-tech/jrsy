import { useEffect, useState } from 'react'
import { RotateCcw, Download } from 'lucide-react'
import { api } from '../../services/db'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { AdminHeader, Panel } from '../../components/admin/kit'
import { PageLoader } from '../../components/ui'

export default function Settings() {
  const { refreshSettings } = useStore()
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => { api.getSettings().then(setForm) }, [])

  async function importCatalogue() {
    setImporting(true)
    try {
      const res = await api.importStarterCatalogue()
      res.ok ? toast.success(res.message) : toast.error(res.message)
      if (res.ok) refreshSettings()
    } catch { toast.error('Import failed. Check your Firestore rules.') }
    finally { setImporting(false) }
  }
  if (!form) return <PageLoader />

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setSocial = (k, v) => setForm((f) => ({ ...f, social: { ...f.social, [k]: v } }))

  async function save() {
    await api.saveSettings({ ...form, deliveryCharge: Number(form.deliveryCharge), freeDeliveryThreshold: Number(form.freeDeliveryThreshold) })
    toast.success('Settings saved.'); refreshSettings()
  }

  function resetDemo() {
    api.resetDemo()
    toast.info('Demo data reset. Reloading…')
    setTimeout(() => window.location.reload(), 800)
  }

  return (
    <div>
      <AdminHeader title="Settings" subtitle="Store configuration"
        action={<button onClick={save} className="btn-ink text-xs">Save changes</button>} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Store details">
          <div className="space-y-4">
            <Field label="Store name" value={form.storeName} onChange={(v) => set('storeName', v)} />
            <Field label="Tagline" value={form.tagline} onChange={(v) => set('tagline', v)} />
            <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} />
            <Field label="Email" value={form.email} onChange={(v) => set('email', v)} />
            <Field label="Address" value={form.address} onChange={(v) => set('address', v)} />
          </div>
        </Panel>

        <Panel title="Delivery & footer">
          <div className="space-y-4">
            <Field label="Delivery charge (৳)" type="number" value={form.deliveryCharge} onChange={(v) => set('deliveryCharge', v)} />
            <Field label="Free delivery over (৳)" type="number" value={form.freeDeliveryThreshold} onChange={(v) => set('freeDeliveryThreshold', v)} />
            <div>
              <label className="label">Footer text</label>
              <textarea rows={3} value={form.footer} onChange={(e) => set('footer', e.target.value)} className="field" />
            </div>
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.storeOpen} onChange={(e) => set('storeOpen', e.target.checked)} className="h-4 w-4 accent-ink" /> Store open for orders</label>
          </div>
        </Panel>

        <Panel title="Social links">
          <div className="space-y-4">
            <Field label="Facebook" value={form.social?.facebook} onChange={(v) => setSocial('facebook', v)} />
            <Field label="Instagram" value={form.social?.instagram} onChange={(v) => setSocial('instagram', v)} />
            <Field label="YouTube" value={form.social?.youtube} onChange={(v) => setSocial('youtube', v)} />
          </div>
        </Panel>

        {api.demo ? (
          <Panel title="Demo data">
            <p className="text-sm text-ink/60">You’re running in demo mode. All data lives in your browser. Reset to restore the original seed catalogue.</p>
            <button onClick={resetDemo} className="btn-ghost mt-4 text-xs"><RotateCcw size={14} /> Reset demo data</button>
          </Panel>
        ) : (
          <Panel title="Starter catalogue">
            <p className="text-sm text-ink/60">Your store is live on Firebase. If Firestore is empty, import the starter catalogue (products, categories, banners, coupons) in one click to get going — then edit freely.</p>
            <button onClick={importCatalogue} disabled={importing} className="btn-ink mt-4 text-xs"><Download size={14} /> {importing ? 'Importing…' : 'Import starter catalogue'}</button>
          </Panel>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="field" />
    </div>
  )
}
