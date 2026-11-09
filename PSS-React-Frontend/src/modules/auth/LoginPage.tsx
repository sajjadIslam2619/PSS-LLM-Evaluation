import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { USER_ROLES, useAuth, type UserRole } from './AuthProvider'
import { api } from '../../shared/api'

export const LoginPage: React.FC = () => {
	const navigate = useNavigate()
	const { login } = useAuth()
	// Invite links prefill the form: ?email=<email>&role=<role>&pass=<password>&invite=<code>
	// The invite code (made by scripts/make_invite_links.py) is what makes a participant
	// eligible for the thank-you email, and it only matches the email and role in the link.
	const [searchParams, setSearchParams] = useSearchParams()
	const [invite] = useState(() => searchParams.get('invite'))
	const [email, setEmail] = useState(() => searchParams.get('email') ?? '')
	const [password, setPassword] = useState(() => searchParams.get('pass') ?? '')
	const [role, setRole] = useState<UserRole | ''>(() => {
		const requested = searchParams.get('role')?.trim().toLowerCase()
		return USER_ROLES.find((r) => r.toLowerCase() === requested) ?? ''
	})
	// Fields filled by an invite link can't be edited; changing them would invalidate the code.
	const [emailLocked] = useState(() => !!invite && !!email)
	const [roleLocked] = useState(() => !!invite && !!role)

	useEffect(() => {
		const inviteKeys = ['email', 'pass', 'role', 'invite']
		if (inviteKeys.some((key) => searchParams.has(key))) {
			const rest = new URLSearchParams(searchParams)
			inviteKeys.forEach((key) => rest.delete(key))
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
			login(identifier, role, invite)
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

