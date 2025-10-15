import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthProvider'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { username } = useAuth()
	if (!username) return <Navigate to="/" replace />
	return <>{children}</>
}


