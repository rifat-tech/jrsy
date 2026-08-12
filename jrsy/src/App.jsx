import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { StoreProvider } from './context/StoreContext'
import { ToastProvider } from './context/ToastContext'
import { RequireAuth, RequireAdmin } from './components/RouteGuards'
import { PageLoader } from './components/ui'
import CustomerLayout from './layouts/CustomerLayout'

const Home = lazy(() => import('./pages/customer/Home'))
const Shop = lazy(() => import('./pages/customer/Shop'))
const ProductDetails = lazy(() => import('./pages/customer/ProductDetails'))
const CustomJersey = lazy(() => import('./pages/customer/CustomJersey'))
const Cart = lazy(() => import('./pages/customer/Cart'))
const Checkout = lazy(() => import('./pages/customer/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/customer/OrderConfirmation'))
const Login = lazy(() => import('./pages/customer/Login'))
const Register = lazy(() => import('./pages/customer/Register'))
const AccountLayout = lazy(() => import('./pages/customer/account/AccountLayout'))
const AccountOverview = lazy(() => import('./pages/customer/account/Overview'))
const AccountOrders = lazy(() => import('./pages/customer/account/Orders'))
const AccountOrderDetails = lazy(() => import('./pages/customer/account/OrderDetails'))
const AccountWishlist = lazy(() => import('./pages/customer/account/Wishlist'))
const AccountAddresses = lazy(() => import('./pages/customer/account/Addresses'))
const AccountProfile = lazy(() => import('./pages/customer/account/Profile'))
const NotFound = lazy(() => import('./pages/customer/NotFound'))

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminCustomers = lazy(() => import('./pages/admin/Customers'))
const AdminReviews = lazy(() => import('./pages/admin/Reviews'))
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'))
const AdminBanners = lazy(() => import('./pages/admin/Banners'))
const AdminInventory = lazy(() => import('./pages/admin/Inventory'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

const S = (el) => <Suspense fallback={<PageLoader />}>{el}</Suspense>

const router = createBrowserRouter([
  {
    element: <CustomerLayout />,
    children: [
      { path: '/', element: S(<Home />) },
      { path: '/shop', element: S(<Shop />) },
      { path: '/football', element: S(<Shop group="Football" />) },
      { path: '/cricket', element: S(<Shop group="Cricket" />) },
      { path: '/custom', element: S(<CustomJersey />) },
      { path: '/product/:slug', element: S(<ProductDetails />) },
      { path: '/cart', element: S(<Cart />) },
      { path: '/checkout', element: S(<Checkout />) },
      { path: '/order/:id', element: S(<OrderConfirmation />) },
      { path: '/login', element: S(<Login />) },
      { path: '/register', element: S(<Register />) },
      {
        path: '/account',
        element: <RequireAuth>{S(<AccountLayout />)}</RequireAuth>,
        children: [
          { index: true, element: S(<AccountOverview />) },
          { path: 'orders', element: S(<AccountOrders />) },
          { path: 'orders/:id', element: S(<AccountOrderDetails />) },
          { path: 'wishlist', element: S(<AccountWishlist />) },
          { path: 'addresses', element: S(<AccountAddresses />) },
          { path: 'profile', element: S(<AccountProfile />) },
        ],
      },
      { path: '*', element: S(<NotFound />) },
    ],
  },
  {
    path: '/admin',
    element: <RequireAdmin>{S(<AdminLayout />)}</RequireAdmin>,
    children: [
      { index: true, element: S(<AdminDashboard />) },
      { path: 'products', element: S(<AdminProducts />) },
      { path: 'categories', element: S(<AdminCategories />) },
      { path: 'orders', element: S(<AdminOrders />) },
      { path: 'customers', element: S(<AdminCustomers />) },
      { path: 'reviews', element: S(<AdminReviews />) },
      { path: 'coupons', element: S(<AdminCoupons />) },
      { path: 'banners', element: S(<AdminBanners />) },
      { path: 'inventory', element: S(<AdminInventory />) },
      { path: 'settings', element: S(<AdminSettings />) },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  )
}
