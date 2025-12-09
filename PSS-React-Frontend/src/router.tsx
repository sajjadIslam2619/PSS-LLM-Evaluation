import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './modules/auth/LoginPage'
import { HomePage } from './modules/home/HomePage'
import { InstructionPage } from './modules/instructions/InstructionPage'
import { ThankYouPage } from './modules/thankyou/ThankYouPage'
import { CuratePostPage } from './modules/curation/CuratePostPage'
import { ProtectedRoute } from './shared/ProtectedRoute'

// This makes sure routing works both locally ("/") and on GitHub Pages ("/PSS-LLM-Evaluation/")
export const router = createBrowserRouter(
  [
    { path: '/', element: <LoginPage /> },
    {
      path: '/instructions',
      element: (
        <ProtectedRoute>
          <InstructionPage />
        </ProtectedRoute>
      ),
    },
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
      path: '/curate-post',
      element: (
        <ProtectedRoute>
          <CuratePostPage />
        </ProtectedRoute>
      ),
    },
  ],
  {
    basename: import.meta.env.BASE_URL, // important line
  }
)
