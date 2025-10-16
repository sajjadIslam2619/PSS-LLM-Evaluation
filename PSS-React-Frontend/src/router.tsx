import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './modules/auth/LoginPage'
import { HomePage } from './modules/home/HomePage'
import { ProtectedRoute } from './shared/ProtectedRoute'

// This makes sure routing works both locally ("/") and on GitHub Pages ("/PSS-LLM-Evaluation/")
export const router = createBrowserRouter(
  [
    { path: '/', element: <LoginPage /> },
    {
      path: '/home',
      element: (
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      ),
    },
  ],
  {
    basename: import.meta.env.BASE_URL, // 👈 important line
  }
)
