import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './modules/auth/LoginPage'
import { HomePage } from './modules/home/HomePage'
import { ThankYouPage } from './modules/thankyou/ThankYouPage'
import { CreatePostPage } from './modules/create/CreatePostPage'
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
    {
      path: '/thank-you',
      element: (
        <ProtectedRoute>
          <ThankYouPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/create-post',
      element: (
        <ProtectedRoute>
          <CreatePostPage />
        </ProtectedRoute>
      ),
    },
  ],
  {
    basename: import.meta.env.BASE_URL, // important line
  }
)
