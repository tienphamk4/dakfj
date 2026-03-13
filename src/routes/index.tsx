import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Spin } from 'antd'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'
import EmployeeRoute from './EmployeeRoute'
import UserLayout from '@/layouts/UserLayout'
import AdminLayout from '@/layouts/AdminLayout'
import EmployeeLayout from '@/layouts/EmployeeLayout'
import AccountLayout from '@/layouts/AccountLayout'

const HomePage = lazy(() => import('@/pages/home-page'))
const LoginPage = lazy(() => import('@/pages/login-page'))
const RegisterPage = lazy(() => import('@/pages/register-page'))
const CartPage = lazy(() => import('@/pages/cart-page'))
const OrderConfirmPage = lazy(() => import('@/pages/order-confirm-page'))
const OrderResultPage = lazy(() => import('@/pages/order-result-page'))

const ProfilePage = lazy(() => import('@/pages/user/profile-page'))
const UserOrdersPage = lazy(() => import('@/pages/user/orders-page'))
const UserOrderDetailPage = lazy(() => import('@/pages/user/order-detail-page'))

const AdminDashboard = lazy(() => import('@/pages/admin/dashboard-page'))
const BrandPage = lazy(() => import('@/pages/admin/brand-page'))
const ColorPage = lazy(() => import('@/pages/admin/color-page'))
const MaterialPage = lazy(() => import('@/pages/admin/material-page'))
const SizePage = lazy(() => import('@/pages/admin/size-page'))
const ProductPage = lazy(() => import('@/pages/admin/product-page'))
const ProductDetailPage = lazy(() => import('@/pages/admin/product-detail-page'))
const UserAdminPage = lazy(() => import('@/pages/admin/user-page'))
const VoucherPage = lazy(() => import('@/pages/admin/voucher-page'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/orders-page'))
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/order-detail-page'))

const EmployeePosPage = lazy(() => import('@/pages/employee/pos-page'))
const EmployeeOrdersPage = lazy(() => import('@/pages/employee/orders-page'))
const EmployeeOrderDetailPage = lazy(() => import('@/pages/employee/order-detail-page'))

const Fallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <Spin size="large" />
  </div>
)

const wrap = (el: JSX.Element) => <Suspense fallback={<Fallback />}>{el}</Suspense>

export const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      { path: '/', element: wrap(<HomePage />) },
      { path: '/login', element: wrap(<LoginPage />) },
      { path: '/register', element: wrap(<RegisterPage />) },
      { path: '/order/result', element: wrap(<OrderResultPage />) },
      {
        element: <PrivateRoute />,
        children: [
          { path: '/cart', element: wrap(<CartPage />) },
          { path: '/order/confirm', element: wrap(<OrderConfirmPage />) },
          {
            element: <AccountLayout />,
            children: [
              { path: '/profile', element: wrap(<ProfilePage />) },
              { path: '/orders', element: wrap(<UserOrdersPage />) },
              { path: '/orders/:id', element: wrap(<UserOrderDetailPage />) },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: wrap(<AdminDashboard />) },
          { path: '/admin/thuong-hieu', element: wrap(<BrandPage />) },
          { path: '/admin/mau-sac', element: wrap(<ColorPage />) },
          { path: '/admin/chat-lieu', element: wrap(<MaterialPage />) },
          { path: '/admin/size', element: wrap(<SizePage />) },
          { path: '/admin/san-pham', element: wrap(<ProductPage />) },
          { path: '/admin/product-detail', element: wrap(<ProductDetailPage />) },
          { path: '/admin/orders', element: wrap(<AdminOrdersPage />) },
          { path: '/admin/orders/:id', element: wrap(<AdminOrderDetailPage />) },
          { path: '/admin/users', element: wrap(<UserAdminPage />) },
          { path: '/admin/vouchers', element: wrap(<VoucherPage />) },
        ],
      },
    ],
  },
  {
    element: <EmployeeRoute />,
    children: [
      {
        element: <EmployeeLayout />,
        children: [
          { path: '/employee/pos', element: wrap(<EmployeePosPage />) },
          { path: '/employee/orders', element: wrap(<EmployeeOrdersPage />) },
          { path: '/employee/orders/:id', element: wrap(<EmployeeOrderDetailPage />) },
        ],
      },
    ],
  },
])
