import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import users from './users.json'
import passwordData from './password.json'
import { useAuth } from './AuthProvider'

export const LoginPage: React.FC = () => {
	const navigate = useNavigate()
	const { login } = useAuth()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!username && users.length > 0) setUsername(users[0].username)
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)
		
		if (password !== passwordData.commonPassword) {
			setError('Invalid password')
			setLoading(false)
			return
		}
		
		await new Promise((r) => setTimeout(r, 200))
		login(username)
		navigate('/home')
		setLoading(false)
	}

	return (
		<div className="container">
			<div style={{ textAlign: 'center', marginBottom: 24 }}>
				<h1 style={{ fontSize: '32px', margin: '0 0 8px 0', color: 'var(--primary)' }}>Peer Support System</h1>
				<p style={{ color: 'var(--muted)', fontSize: '16px', margin: 0 }}>Sign in to continue</p>
			</div>
			<form onSubmit={handleSubmit} className="card">
				<label>
					<span>Select user</span>
					<select value={username} onChange={(e) => setUsername(e.target.value)}>
						{users.map((u) => (
							<option key={u.id} value={u.username}>{u.username}</option>
						))}
					</select>
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

