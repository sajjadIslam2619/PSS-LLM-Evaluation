import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type AuthContextValue = {
	username: string | null
	login: (username: string) => void
	logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [username, setUsername] = useState<string | null>(null)

	useEffect(() => {
		const saved = localStorage.getItem('auth_username')
		if (saved) setUsername(saved)
	}, [])

	const login = useCallback((newUsername: string) => {
		setUsername(newUsername)
		localStorage.setItem('auth_username', newUsername)
	}, [])

	const logout = useCallback(() => {
		setUsername(null)
		localStorage.removeItem('auth_username')
	}, [])

	const value = useMemo(() => ({ username, login, logout }), [username, login, logout])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}


