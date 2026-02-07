const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

type LoginRequest = { username: string; password: string }
type LoginResponse = { token: string }

export type RedditPost = {
	id: number
	content: string
	category: string
	labels?: { name: string; percentage: number }[]
}

export type UserResponseCreate = {
	user_identifier: string
	article_id: number
	ai_generated_response?: string
	empathy?: string
	relevant?: string
	safe?: string
	modified_response?: string
	mental_status?: string
}

export type CreateOwnPostResponseCreate = {
	user_identifier: string
	article_id?: number
	post_content?: string
	ai_generated_response?: string
	empathy?: string
	relevant?: string
	safe?: string
	modified_response?: string
	ai_mental_status?: string
	mental_status?: string
}

export type FeedbackCreate = {
	user_identifier: string
	rate: number
	comment?: string
}

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
		return await request<LoginResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(body),
		})
	},

	async getRedditPosts(): Promise<{ posts: RedditPost[] }> {
		return await request<{ posts: RedditPost[] }>('/posts/reddit')
	},

	async getDetectedLabels(post_content: string): Promise<{ labels: { name: string; percentage: number }[]; error?: string }> {
		return await request<{ labels: { name: string; percentage: number }[]; error?: string }>('/posts/detect-labels', {
			method: 'POST',
			body: JSON.stringify({ post_content }),
		})
	},

	async getGeneratedResponse(post_content: string): Promise<{ response: string; error?: string | null }> {
		return await request<{ response: string; error?: string | null }>('/posts/generate-response', {
			method: 'POST',
			body: JSON.stringify({ post_content }),
		})
	},

	async createUserResponse(body: UserResponseCreate): Promise<unknown> {
		return await request('/responses', {
			method: 'POST',
			body: JSON.stringify(body),
		})
	},

	async createOwnPostResponse(body: CreateOwnPostResponseCreate): Promise<unknown> {
		return await request('/create-own-post', {
			method: 'POST',
			body: JSON.stringify(body),
		})
	},

	async createFeedback(body: FeedbackCreate): Promise<unknown> {
		return await request('/feedback', {
			method: 'POST',
			body: JSON.stringify(body),
		})
	},
}
