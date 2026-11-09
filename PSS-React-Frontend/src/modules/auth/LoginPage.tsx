import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { USER_ROLES, useAuth, type UserRole } from './AuthProvider'
import { api } from '../../shared/api'

export const LoginPage: React.FC = () => {
	const navigate = useNavigate()
	const { login } = useAuth()
	// Invitation links prefill the form: ?user=<email>&role=<role>&pass=<password> (email= works too).
	// Only a login from such a link is eligible for the thank-you email; the link's password is
	// what the backend checks.
	const [searchParams, setSearchParams] = useSearchParams()
	const [linkPassword] = useState(() => {
		const linkEmail = searchParams.get('email') ?? searchParams.get('user')
		if (!linkEmail?.trim() || !searchParams.get('role')?.trim()) return null
		return searchParams.get('pass') || null
	})
	const [email, setEmail] = useState(() => (searchParams.get('email') ?? searchParams.get('user') ?? '').trim())
	const [password, setPassword] = useState(() => searchParams.get('pass') ?? '')
	const [role, setRole] = useState<UserRole | ''>(() => {
		const requested = searchParams.get('role')?.trim().toLowerCase()
		return USER_ROLES.find((r) => r.toLowerCase() === requested) ?? ''
	})
	// Fields filled by an invitation link can't be edited.
	const [emailLocked] = useState(() => !!linkPassword && !!email)
	const [roleLocked] = useState(() => !!linkPassword && !!role)

	useEffect(() => {
		const linkKeys = ['email', 'user', 'pass', 'role']
		if (linkKeys.some((key) => searchParams.has(key))) {
			const rest = new URLSearchParams(searchParams)
			linkKeys.forEach((key) => rest.delete(key))
			setSearchParams(rest, { replace: true })
		}
	}, [searchParams, setSearchParams])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		const identifier = email.trim().toLowerCase()
		if (!identifier || !role) return
		setLoading(true)
		try {
			await api.login({ username: identifier, password })
			login(identifier, role, linkPassword)
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
				<h1 style={{ fontSize: '32px', margin: '0 0 8px 0', color: 'var(--primary)' }}>Peer Support Evaluation System</h1>
				<p style={{ color: 'var(--muted)', fontSize: '16px', margin: 0 }}>Sign in to continue</p>
			</div>
			<form onSubmit={handleSubmit} className="card">
				<label>
					<span>Email</span>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email"
						required
						autoComplete="email"
						readOnly={emailLocked}
					/>
				</label>
				<label>
					<span>Role</span>
					<select
						value={role}
						onChange={(e) => setRole(e.target.value as UserRole | '')}
						required
						disabled={roleLocked}
					>
						<option value="">Select your role</option>
						{USER_ROLES.map((option) => (
							<option key={option} value={option}>{option}</option>
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

