import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from '../components/customer/Header'
import Footer from '../components/customer/Footer'
import ContactWidget from '../components/customer/ContactWidget'

export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ContactWidget />
      <ScrollRestoration />
    </div>
  )
}
