import { useEffect, useState } from 'react'
import { Plus, Trash2, Upload, Save } from 'lucide-react'
import { api } from '../../services/db'
import { uploadImage } from '../../services/storage'
import { useToast } from '../../context/ToastContext'
import { AdminHeader, Panel } from '../../components/admin/kit'
import { PageLoader, Spinner } from '../../components/ui'
import { money } from '../../utils/format'

const uid = () => Math.random().toString(36).slice(2, 8)

export default function CustomBuilder() {
  const toast = useToast()
  const [cfg, setCfg] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState('')

  useEffect(() => { api.getCustomConfig().then(setCfg) }, [])
  if (!cfg) return <PageLoader label="Loading custom builder settings" />

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }))

  // ---- fabrics ----
  const updFabric = (id, k, v) => set({ fabrics: cfg.fabrics.map((f) => (f.id === id ? { ...f, [k]: v } : f)) })
  const addFabric = () => set({ fabrics: [...cfg.fabrics, { id: uid(), name: 'New fabric', price: 300, moq: 10, color: '#888888', image: '' }] })
  const delFabric = (id) => set({ fabrics: cfg.fabrics.filter((f) => f.id !== id) })
  async function fabricImg(id, file) {
    if (!file) return
    setUploadingId(id)
    try { updFabric(id, 'image', await uploadImage(file, 'fabrics')) }
    finally { setUploadingId('') }
  }

  // ---- add-on lists (sleeves/necks) ----
  const updList = (key, id, k, v) => set({ [key]: cfg[key].map((x) => (x.id === id ? { ...x, [k]: v } : x)) })
  const addItem = (key, item) => set({ [key]: [...cfg[key], { id: uid(), ...item }] })
  const delItem = (key, id) => set({ [key]: cfg[key].filter((x) => x.id !== id) })

  // ---- colours ----
  const updColor = (i, v) => set({ colors: cfg.colors.map((c, idx) => (idx === i ? v : c)) })
  const addColor = () => set({ colors: [...cfg.colors, '#999999'] })
  const delColor = (i) => set({ colors: cfg.colors.filter((_, idx) => idx !== i) })

  async function save() {
    setSaving(true)
    try {
      const clean = {
        ...cfg,
        fabrics: cfg.fabrics.map((f) => ({ ...f, price: Number(f.price) || 0, moq: Number(f.moq) || 1 })),
        sleeves: cfg.sleeves.map((s) => ({ ...s, fee: Number(s.fee) || 0 })),
        necks: cfg.necks.map((n) => ({ ...n, fee: Number(n.fee) || 0 })),
        frontNumberFee: Number(cfg.frontNumberFee) || 0,
      }
      await api.saveCustomConfig(clean)
      toast.success('Custom builder updated. Changes are live.')
    } catch { toast.error('Could not save. Try again.') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <AdminHeader title="Custom Jersey" subtitle="Manage fabrics, prices, MOQ, add-ons, colours & fonts — updates the builder instantly"
        action={<button onClick={save} disabled={saving} className="btn-ink text-xs">{saving ? <Spinner size={14} /> : <><Save size={14} /> Save changes</>}</button>} />

      {/* FABRICS */}
      <Panel title="Fabrics" className="mb-6" action={<button onClick={addFabric} className="btn-ghost text-xs"><Plus size={14} /> Add fabric</button>}>
        <div className="space-y-3">
          {cfg.fabrics.map((f) => (
            <div key={f.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 p-3">
              {/* swatch: photo or colour */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ink/10" style={{ background: f.color }}>
                {f.image && <img src={f.image} alt="" className="h-full w-full object-cover" />}
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/40 text-white opacity-0 hover:opacity-100">
                  {uploadingId === f.id ? <Spinner size={14} /> : <Upload size={14} />}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => fabricImg(f.id, e.target.files?.[0])} />
                </label>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                <Field label="Name" value={f.name} onChange={(v) => updFabric(f.id, 'name', v)} />
                <Field label="Price ৳" type="number" value={f.price} onChange={(v) => updFabric(f.id, 'price', v)} />
                <Field label="MOQ" type="number" value={f.moq} onChange={(v) => updFabric(f.id, 'moq', v)} />
                <div>
                  <label className="label">Fallback colour</label>
                  <input type="color" value={f.color} onChange={(e) => updFabric(f.id, 'color', e.target.value)} className="h-9 w-full rounded-lg border border-ink/15" />
                </div>
              </div>
              <button onClick={() => delFabric(f.id)} className="rounded-lg p-2 text-ink/50 hover:bg-flare/10 hover:text-flare"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink/40">Hover a swatch to upload a fabric photo. No photo → the fallback colour shows.</p>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SLEEVES */}
        <Panel title="Sleeve options" action={<button onClick={() => addItem('sleeves', { name: 'New', fee: 0 })} className="btn-ghost text-xs"><Plus size={14} /> Add</button>}>
          <AddonList items={cfg.sleeves} onName={(id, v) => updList('sleeves', id, 'name', v)} onFee={(id, v) => updList('sleeves', id, 'fee', v)} onDel={(id) => delItem('sleeves', id)} />
        </Panel>
        {/* NECKS */}
        <Panel title="Neck options" action={<button onClick={() => addItem('necks', { name: 'New', fee: 0 })} className="btn-ghost text-xs"><Plus size={14} /> Add</button>}>
          <AddonList items={cfg.necks} onName={(id, v) => updList('necks', id, 'name', v)} onFee={(id, v) => updList('necks', id, 'fee', v)} onDel={(id) => delItem('necks', id)} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* FRONT NUMBER + NOTE */}
        <Panel title="Extras & note">
          <Field label="Front number fee ৳" type="number" value={cfg.frontNumberFee} onChange={(v) => set({ frontNumberFee: v })} />
          <div className="mt-3">
            <label className="label">Note shown on builder</label>
            <input value={cfg.note} onChange={(e) => set({ note: e.target.value })} className="field" />
          </div>
        </Panel>

        {/* COLOURS */}
        <Panel title="Base colours" action={<button onClick={addColor} className="btn-ghost text-xs"><Plus size={14} /> Add</button>}>
          <div className="flex flex-wrap gap-2">
            {cfg.colors.map((c, i) => (
              <div key={i} className="flex items-center gap-1 rounded-lg border border-ink/10 p-1">
                <input type="color" value={c} onChange={(e) => updColor(i, e.target.value)} className="h-8 w-8 rounded" />
                <button onClick={() => delColor(i)} className="text-ink/40 hover:text-flare"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* FONTS */}
      <Panel title="Fonts" className="mt-6" action={<button onClick={() => addItem('fonts', { label: 'New', family: "'Archivo', sans-serif" })} className="btn-ghost text-xs"><Plus size={14} /> Add</button>}>
        <div className="grid gap-2 sm:grid-cols-2">
          {cfg.fonts.map((ft) => (
            <div key={ft.id || ft.label} className="flex items-center gap-2 rounded-xl border border-ink/10 p-2">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-ink/5 text-lg font-black" style={{ fontFamily: ft.family }}>10</span>
              <input value={ft.label} onChange={(e) => set({ fonts: cfg.fonts.map((x) => (x === ft ? { ...x, label: e.target.value } : x)) })} className="field flex-1 py-1.5 text-sm" />
              <input value={ft.family} onChange={(e) => set({ fonts: cfg.fonts.map((x) => (x === ft ? { ...x, family: e.target.value } : x)) })} className="field flex-[2] py-1.5 text-xs" />
              <button onClick={() => set({ fonts: cfg.fonts.filter((x) => x !== ft) })} className="text-ink/40 hover:text-flare"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink/40">To add a brand-new font family you must also load it in index.html; the six built-in fonts already work.</p>
      </Panel>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-ink text-xs">{saving ? <Spinner size={14} /> : <><Save size={14} /> Save changes</>}</button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="field py-1.5 text-sm" />
    </div>
  )
}

function AddonList({ items, onName, onFee, onDel }) {
  return (
    <div className="space-y-2">
      {items.map((x) => (
        <div key={x.id} className="flex items-center gap-2">
          <input value={x.name} onChange={(e) => onName(x.id, e.target.value)} className="field flex-1 py-1.5 text-sm" />
          <div className="flex items-center gap-1">
            <span className="text-xs text-ink/40">৳</span>
            <input type="number" value={x.fee} onChange={(e) => onFee(x.id, e.target.value)} className="field w-20 py-1.5 text-sm" />
          </div>
          <button onClick={() => onDel(x.id)} className="text-ink/40 hover:text-flare"><Trash2 size={15} /></button>
        </div>
      ))}
    </div>
  )
}
