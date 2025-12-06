import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type AuthContextValue = {
	username: string | null
	hasSeenInstructions: boolean
	login: (username: string) => void
	logout: () => void
	markInstructionsAsSeen: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [username, setUsername] = useState<string | null>(null)
	const [hasSeenInstructions, setHasSeenInstructions] = useState<boolean>(false)

	useEffect(() => {
		const saved = localStorage.getItem('auth_username')
		if (saved) setUsername(saved)
		const seenInstructions = localStorage.getItem('has_seen_instructions')
		if (seenInstructions === 'true') setHasSeenInstructions(true)
	}, [])

	const login = useCallback((newUsername: string) => {
		setUsername(newUsername)
		localStorage.setItem('auth_username', newUsername)
	}, [])

	const logout = useCallback(() => {
		setUsername(null)
		localStorage.removeItem('auth_username')
		setHasSeenInstructions(false)
		localStorage.removeItem('has_seen_instructions')
	}, [])

	const markInstructionsAsSeen = useCallback(() => {
		setHasSeenInstructions(true)
		localStorage.setItem('has_seen_instructions', 'true')
	}, [])

	const value = useMemo(
		() => ({ username, hasSeenInstructions, login, logout, markInstructionsAsSeen }),
		[username, hasSeenInstructions, login, logout, markInstructionsAsSeen]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}


