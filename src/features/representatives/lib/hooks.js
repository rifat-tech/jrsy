/* React hooks used by the public page and the admin pages. */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadNetwork } from './service'
import { buildIndex } from './logic'

export function useNetwork() {
  const [state, setState] = useState({ loading: true, error: '', data: null })
  const load = useCallback(async (force = false) => {
    setState((s) => ({ ...s, loading: !s.data, error: '' }))
    try { setState({ loading: false, error: '', data: await loadNetwork({ force }) }) }
    catch (e) { setState({ loading: false, error: e?.message || 'Could not load the network.', data: null }) }
  }, [])
  useEffect(() => { load() }, [load])
  const idx = useMemo(() => (state.data ? buildIndex(state.data) : null), [state.data])
  return { loading: state.loading, error: state.error, idx, raw: state.data, reload: () => load(true) }
}

// Sets the browser tab title + search-engine description for the current page
export function useDocumentMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title
    let tag = document.querySelector('meta[name="description"]')
    const prevDesc = tag?.getAttribute('content')
    if (!tag) { tag = document.createElement('meta'); tag.name = 'description'; document.head.appendChild(tag) }
    if (title) document.title = title
    if (description) tag.setAttribute('content', description)
    return () => { document.title = prevTitle; if (prevDesc != null) tag.setAttribute('content', prevDesc) }
  }, [title, description])
}
