import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { api } from '../../shared/api'

export const LoginPage: React.FC = () => {
	const navigate = useNavigate()
	const { login } = useAuth()
	const [emailOrName, setEmailOrName] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		const identifier = emailOrName.trim()
		if (!identifier) return
		setLoading(true)
		try {
			await api.login({ username: identifier, password })
			login(identifier)
			navigate('/home')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Invalid password')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="container">
			<div style={{ textAlign: 'center', marginBottom: 24 }}>
				<h1 style={{ fontSize: '32px', margin: '0 0 8px 0', color: 'var(--primary)' }}>Peer Support System</h1>
				<p style={{ color: 'var(--muted)', fontSize: '16px', margin: 0 }}>Sign in to continue</p>
			</div>
			<form onSubmit={handleSubmit} className="card">
				<label>
					<span>Email or Name</span>
					<input
						type="text"
						value={emailOrName}
						onChange={(e) => setEmailOrName(e.target.value)}
						placeholder="Enter your email or name"
						required
						autoComplete="username"
					/>
				</label>
				<label>
					<span>Password</span>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter common password"
						required
					/>
				</label>
				{error && <div className="error">{error}</div>}
				<button type="submit" disabled={loading}>
					{loading ? 'Signing in…' : 'Sign in'}
				</button>
			</form>
		</div>
	)
}

