const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

type LoginRequest = { username: string; password: string }
type LoginResponse = { token: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers || {}),
		},
	})
	if (!res.ok) {
		const text = await res.text().catch(() => '')
		throw new Error(text || `HTTP ${res.status}`)
	}
	return (await res.json()) as T
}

export const api = {
	async login(body: LoginRequest): Promise<LoginResponse> {
		// Adjust to your backend's login endpoint shape
		return await request<LoginResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(body),
		})
	},
}


