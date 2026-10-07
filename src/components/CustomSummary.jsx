import { useEffect, useState } from 'react'
import { Download, ImageOff } from 'lucide-react'
import { api } from '../services/db'

// Shows everything the customer chose in the custom-jersey builder.
//   compact  -> short one-line-per-field list (cart)
//   showFile -> also loads the customer's full uploaded artwork with a download button (admin / order pages)
export function CustomSummary({ c, compact = false, showFile = false }) {
  if (!c) return null

  const rows = [
    ['Fabric', c.fabric],
    ['Sleeve', c.sleeve],
    ['Neck', c.neck],
    ['Back name', c.name || '—'],
    ['Number', c.number || '—'],
    ['Font', c.font],
    ['Front number', c.frontNumber ? 'Yes' : 'No'],
  ].filter(([, v]) => v)

  return (
    <div className={`rounded-xl bg-chalk text-xs ${compact ? 'mt-2 p-2.5' : 'mt-2 p-3'}`}>
      <dl className={`grid gap-x-4 gap-y-1 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {c.color && (
          <div>
            <dt className="text-ink/40">Base colour</dt>
            <dd className="flex items-center gap-1.5 font-bold text-ink">
              <span className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-ink/20" style={{ background: c.color }} />
              {c.color}
            </dd>
          </div>
        )}
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-ink/40">{k}</dt>
            <dd className="font-bold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {(c.logoId || c.logoThumb) && (
        showFile
          ? <CustomFile id={c.logoId} fallback={c.logoThumb} name={c.logoName} />
          : (
            <div className="mt-2 flex items-center gap-2">
              {c.logoThumb && <img src={c.logoThumb} alt="" className="h-8 w-8 rounded bg-white object-contain ring-1 ring-ink/10" />}
              <span className="text-ink/50">Crest / logo attached</span>
            </div>
          )
      )}
    </div>
  )
}

// Loads the full-size customer artwork by id and offers it for download.
function CustomFile({ id, fallback, name }) {
  const [file, setFile] = useState(undefined) // undefined = loading, null = not available

  useEffect(() => {
    let alive = true
    if (!id) { setFile(null); return }
    api.getCustomFile(id).then((f) => { if (alive) setFile(f) }).catch(() => { if (alive) setFile(null) })
    return () => { alive = false }
  }, [id])

  // Only ever render real images. (Never trust a stored string as a link target.)
  const safe = file?.dataUrl && /^data:image\/(png|jpe?g|webp|gif|svg\+xml);/i.test(file.dataUrl)

  return (
    <div className="mt-3 border-t border-ink/10 pt-3">
      <p className="mb-1.5 text-ink/40">Customer's uploaded file</p>
      {file === undefined && <p className="text-ink/40">Loading file…</p>}
      {file !== undefined && safe && (
        <div className="flex items-center gap-3">
          <img src={file.dataUrl} alt="Customer artwork" className="h-24 w-24 rounded-lg bg-white object-contain ring-1 ring-ink/10" />
          <div className="min-w-0">
            <p className="truncate font-bold text-ink">{file.name || name || 'artwork'}</p>
            <a href={file.dataUrl} download={file.name || name || 'artwork.png'} className="btn-ink mt-1.5 inline-flex px-3 py-1.5 text-[11px]">
              <Download size={13} /> Download file
            </a>
          </div>
        </div>
      )}
      {file !== undefined && !safe && (
        <div className="flex items-center gap-3 text-ink/50">
          {fallback ? <img src={fallback} alt="" className="h-12 w-12 rounded bg-white object-contain ring-1 ring-ink/10" /> : <ImageOff size={18} />}
          <span>Full-size file isn't available to you for this order{name ? ` (${name})` : ''}.</span>
        </div>
      )}
    </div>
  )
}
