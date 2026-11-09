import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const USER_ROLES = [
	'Peer Support Specialist',
	'Veteran',
	'Research Team Member',
	'Admin',
	'Others',
] as const

export type UserRole = (typeof USER_ROLES)[number]

type AuthContextValue = {
	username: string | null
	role: UserRole | null
	/** Password carried by the invitation link; only set when logging in through one.
	 * Required for the thank-you email. */
	linkPassword: string | null
	hasSeenInstructions: boolean
	login: (username: string, role: UserRole, linkPassword: string | null) => void
	logout: () => void
	markInstructionsAsSeen: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [username, setUsername] = useState<string | null>(null)
	const [role, setRole] = useState<UserRole | null>(null)
	const [linkPassword, setLinkPassword] = useState<string | null>(null)
	const [hasSeenInstructions, setHasSeenInstructions] = useState<boolean>(false)

	useEffect(() => {
		const saved = localStorage.getItem('auth_username')
		if (saved) setUsername(saved)
		const savedRole = localStorage.getItem('auth_role')
		if (savedRole && USER_ROLES.includes(savedRole as UserRole)) setRole(savedRole as UserRole)
		setLinkPassword(localStorage.getItem('auth_link_password'))
		const seenInstructions = localStorage.getItem('has_seen_instructions')
		if (seenInstructions === 'true') setHasSeenInstructions(true)
	}, [])

	const login = useCallback((newUsername: string, newRole: UserRole, newLinkPassword: string | null) => {
		setUsername(newUsername)
		setRole(newRole)
		setLinkPassword(newLinkPassword)
		localStorage.setItem('auth_username', newUsername)
		localStorage.setItem('auth_role', newRole)
		if (newLinkPassword) localStorage.setItem('auth_link_password', newLinkPassword)
		else localStorage.removeItem('auth_link_password')
	}, [])

	const logout = useCallback(() => {
		setUsername(null)
		setRole(null)
		setLinkPassword(null)
		localStorage.removeItem('auth_username')
		localStorage.removeItem('auth_role')
		localStorage.removeItem('auth_link_password')
		setHasSeenInstructions(false)
		localStorage.removeItem('has_seen_instructions')
	}, [])

	const markInstructionsAsSeen = useCallback(() => {
		setHasSeenInstructions(true)
		localStorage.setItem('has_seen_instructions', 'true')
	}, [])

	const value = useMemo(
		() => ({ username, role, linkPassword, hasSeenInstructions, login, logout, markInstructionsAsSeen }),
		[username, role, linkPassword, hasSeenInstructions, login, logout, markInstructionsAsSeen]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

