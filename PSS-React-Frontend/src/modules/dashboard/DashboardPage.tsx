import React from 'react'
import { useAuth } from '../auth/AuthProvider'

export const DashboardPage: React.FC = () => {
	const { logout } = useAuth()
	return (
		<div className="container">
			<h1>Dashboard</h1>
			<p>You are logged in.</p>
			<button onClick={logout}>Log out</button>
		</div>
	)
}


