import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './modules/auth/LoginPage'
import { HomePage } from './modules/home/HomePage'
import { ProtectedRoute } from './shared/ProtectedRoute'

export const router = createBrowserRouter([
	{ path: '/', element: <LoginPage /> },
	{ path: '/home', element: <ProtectedRoute><HomePage /></ProtectedRoute> },
])

