import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'

export const ThankYouPage: React.FC = () => {
	const { username, logout } = useAuth()
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	
	const handleLogout = () => {
		setIsLoggingOut(true)
		setTimeout(() => {
			logout()
		}, 1000)
	}
	
	return (
		<div className="container">
			<div style={{ textAlign: 'center', marginBottom: 24 }}>
				<h1 style={{ fontSize: '32px', margin: '0 0 16px 0', color: 'var(--primary)' }}>Thank You!</h1>
				<p style={{ color: 'var(--muted)', fontSize: '18px', margin: '0 0 24px 0' }}>
					Thank you for completing the evaluation, {username}!
				</p>
				<p style={{ color: 'var(--text)', fontSize: '16px', margin: '0 0 32px 0' }}>
					Your feedback has been successfully submitted and will help improve our peer support system.
				</p>
				<button 
					onClick={handleLogout}
					style={{
						padding: '8px 16px',
						borderRadius: '6px',
						border: '2px solid var(--primary)',
						background: isLoggingOut ? 'var(--primary)' : 'transparent',
						color: isLoggingOut ? 'white' : 'var(--primary)',
						cursor: 'pointer',
						fontSize: '14px',
						fontWeight: '500',
						transition: 'all 0.3s ease'
					}}
				>
					{isLoggingOut ? 'Logging out...' : 'Logout'}
				</button>
			</div>
		</div>
	)
}
