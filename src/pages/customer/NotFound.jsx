import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-jrsy flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-8xl font-black italic text-ink/10">404</p>
      <h1 className="mt-2 text-3xl font-black">Off the pitch</h1>
      <p className="mt-2 text-ink/50">We couldn’t find that page.</p>
      <Link to="/" className="btn-ink mt-6">Back home</Link>
    </div>
  )
}
