import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { api, type RedditPost } from '../../shared/api'
import labels from './labels.json'

export const HomePage: React.FC = () => {
	const navigate = useNavigate()
	const { username, logout } = useAuth()
	const [posts, setPosts] = useState<RedditPost[]>([])
	const [postsLoading, setPostsLoading] = useState(true)
	const [postsError, setPostsError] = useState<string | null>(null)
	const [currentPostIndex, setCurrentPostIndex] = useState(0)
	const [post, setPost] = useState('')
	const [response, setResponse] = useState('')
	const [selectedLabels, setSelectedLabels] = useState<{ name: string, percentage: number }[]>([])
	const [empathy, setEmpathy] = useState<string>('')
	const [relevant, setRelevant] = useState<string>('')
	const [safe, setSafe] = useState<string>('')
	// const [isSatisfiedWithLabels, setIsSatisfiedWithLabels] = useState<boolean | null>(null)
	const [customLabels, setCustomLabels] = useState<string[]>([])
	//const [isSubmitted, setIsSubmitted] = useState(false)
	//const [allPostsCompleted, setAllPostsCompleted] = useState(false)
	const [isFinalSubmitted, setIsFinalSubmitted] = useState(false)
	const [userCustomResponse, setUserCustomResponse] = useState('')
	const [responseGenerating, setResponseGenerating] = useState(false)



	// Fetch Reddit posts from backend
	useEffect(() => {
		api.getRedditPosts()
			.then((data) => {
				setPosts(data.posts)
				if (data.posts.length > 0) setPost(data.posts[0].content)
			})
			.catch((err) => setPostsError(err instanceof Error ? err.message : 'Failed to load posts'))
			.finally(() => setPostsLoading(false))
	}, [])

	// Use mental status labels from redditPosts.json for the current post
	useEffect(() => {
		if (posts.length === 0) return
		const current = posts[currentPostIndex]
		setSelectedLabels(current?.labels ?? [])
	}, [posts, currentPostIndex])

	const generateResponse = async () => {
		if (!post.trim()) return
		setResponseGenerating(true)
		try {
			const { response: text } = await api.getGeneratedResponse(post.trim())
			setResponse(text || '')
		} catch (e) {
			console.error('Failed to generate response:', e)
			alert('Failed to generate response. Please try again.')
		} finally {
			setResponseGenerating(false)
		}
	}

	const handleLabelSelection = (label: string) => {
		if (customLabels.includes(label)) {
			setCustomLabels(customLabels.filter(l => l !== label))
		} else {
			setCustomLabels([...customLabels, label])
		}
	}

	//const validateCurrentPost = () => {
	//const warnings = []

	// if (selectedLabels.length === 0 && customLabels.length === 0) {
	// 	warnings.push('Please classify the post')
	// }

	// Check if user selected "No" for satisfaction but didn't select custom labels
	// if (isSatisfiedWithLabels === false && customLabels.length === 0) {
	// 	warnings.push('Please select labels since you are not satisfied with detected labels')
	// }

	// if (!response.trim()) {
	// 	warnings.push('Please generate a response')
	// }

	// if (empathy === '' || relevant === '' || safe === '') {
	// 	warnings.push('Please evaluate all three categories (Empathy, Relevant, Safe)')
	// }

	//return warnings
	//}

	const saveCurrentResponse = async () => {
		if (!username || posts.length === 0) return
		const p = posts[currentPostIndex]
		const postId = p?.id ?? currentPostIndex + 1
		const mentalStatus = [...selectedLabels.map((l) => l.name), ...customLabels].filter(Boolean).join(', ') || undefined
		await api.createUserResponse({
			user_identifier: username,
			post_id: postId,
			ai_generated_response: response || undefined,
			empathy: empathy || undefined,
			relevant: relevant || undefined,
			safe: safe || undefined,
			modified_response: userCustomResponse || undefined,
			mental_status: mentalStatus,
		})
	}

	const previousPost = () => {
		if (currentPostIndex > 0) {
			const prevIndex = currentPostIndex - 1
			setCurrentPostIndex(prevIndex)
			setPost(posts[prevIndex]?.content ?? '')
			setResponse('')
			setUserCustomResponse('')
			setSelectedLabels([])
			setEmpathy('')
			setRelevant('')
			setSafe('')
			setCustomLabels([])
		}
	}

	const nextPost = async () => {
		if (posts.length === 0) return
		try {
			await saveCurrentResponse()
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to save response')
			return
		}
		if (currentPostIndex < posts.length - 1) {
			const nextIndex = currentPostIndex + 1
			setCurrentPostIndex(nextIndex)
			setPost(posts[nextIndex]?.content ?? '')
			setResponse('')
			setUserCustomResponse('')
			setSelectedLabels(posts[nextIndex]?.labels ?? [])
			setEmpathy('')
			setRelevant('')
			setSafe('')
			setCustomLabels([])
		}
	}

	const submitAllReviews = async () => {
		if (!username) return
		try {
			await saveCurrentResponse()
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to save response')
			return
		}
		setIsFinalSubmitted(true)
		setTimeout(() => navigate('/thank-you'), 1500)
	}





	const EvaluationScale: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => {
		const options = ['Agree', 'Somewhat Agree', 'Neutral', 'Somewhat Disagree', 'Disagree', 'Not Applicable']
		const isMobile = window.innerWidth < 480

		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 4 : 8 }}>
				<span style={{ fontSize: isMobile ? '16px' : '18px', color: 'var(--muted)' }}>{label}:</span>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 4 : 6 }}>
					{options.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => onChange(option)}
							style={{
								padding: isMobile ? '6px 8px' : '8px 12px',
								borderRadius: '6px',
								border: '2px solid',
								borderColor: value === option ? 'var(--primary)' : '#2a355f',
								background: value === option ? 'var(--primary)' : 'transparent',
								color: value === option ? 'white' : 'var(--text)',
								cursor: 'pointer',
								fontSize: isMobile ? '15px' : '16px',
								fontWeight: '500',
								minWidth: isMobile ? '60px' : '80px',
								flex: '1',
								maxWidth: isMobile ? '100px' : '120px',
								minHeight: isMobile ? '36px' : 'auto'
							}}
						>
							{option}
						</button>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="container">
			<div style={{
				display: 'flex',
				flexDirection: window.innerWidth < 480 ? 'column' : 'row',
				justifyContent: 'space-between',
				alignItems: window.innerWidth < 480 ? 'flex-start' : 'center',
				gap: window.innerWidth < 480 ? '8px' : '0',
				marginBottom: window.innerWidth < 480 ? 8 : 16
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
					<h1 style={{ margin: 0, fontSize: window.innerWidth < 480 ? '22px' : '30px' }}>
						Welcome{username ? `, ${username}` : ''}!
					</h1>
				</div>
				<button onClick={logout} style={{
					padding: window.innerWidth < 480 ? '8px 12px' : '6px 12px',
					fontSize: window.innerWidth < 480 ? '16px' : '17px',
					alignSelf: window.innerWidth < 480 ? 'flex-start' : 'center'
				}}>Logout</button>
			</div>

			<div className="card">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: window.innerWidth < 480 ? 8 : 16 }}>
					<h2 style={{ margin: 0, fontSize: window.innerWidth < 480 ? '20px' : '22px' }}>Review Reddit Posts ({posts.length ? currentPostIndex + 1 : 0} of {posts.length})</h2>
				</div>

				{postsLoading && (
					<p style={{ color: 'var(--muted)', margin: '16px 0' }}>Loading posts...</p>
				)}
				{!postsLoading && postsError && (
					<p style={{ color: '#e57373', margin: '16px 0' }}>{postsError}</p>
				)}
				{!postsLoading && !postsError && (
				<>
				{/* Main layout: Left panel (Post + Comment) and Right panel (Labels) */}
				<div style={{
					display: 'flex',
					flexDirection: window.innerWidth < 768 ? 'column' : 'row',
					gap: window.innerWidth < 768 ? '16px' : '24px',
					marginBottom: '16px'
				}}>
					{/* Left panel: Post and Comment */}
					<div style={{ flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
						{/* Post Section */}
						<div>
							<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
								<span
									style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
									title="Read the social media post carefully. The AI will automatically detect and display labels that categorize the post's content."
								>1️⃣</span> Please read the below post carefully
							</span>
							<div style={{
								minHeight: window.innerWidth < 480 ? '200px' : '400px',
								maxHeight: '600px',
								overflow: 'auto',
								padding: '12px',
								border: '1px solid #2a355f',
								borderRadius: '8px',
								background: 'rgba(42, 53, 95, 0.2)',
								color: 'var(--text)',
								whiteSpace: 'pre-wrap',
								wordWrap: 'break-word',
								lineHeight: '1.6',
								fontSize: '17px'
							}}>
								{post || 'No post content'}
							</div>
						</div>

						{/* Labels section for mobile - appears after post */}
						{window.innerWidth < 768 && selectedLabels.length > 0 && (
							<div style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '10px'
							}}>
								<div>
									<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
										<span
											style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
											title="Check if the AI-detected labels accurately represent the post. If you disagree, select your own labels from the available options below."
										>2️⃣</span> Please check AI detected mental state labels of the post
									</span>
									<div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
										{selectedLabels.map((label, index) => (
											<span key={index} style={{
												background: 'var(--primary)',
												color: 'white',
												padding: '3px 6px',
												borderRadius: '4px',
												fontSize: '14px',
												whiteSpace: 'nowrap'
											}}>
												{label.name} {label.percentage}%
											</span>
										))}
									</div>
								</div>

								<div>
									<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
										<span
											style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
											title="Are the labels accurate? If not, please select labels based on your thoughts."
										>3️⃣</span> Are the labels accurate? If not, please select labels based on your thoughts:
									</span>
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
										{labels.map((label: string) => (
											<button
												key={label}
												type="button"
												onClick={() => handleLabelSelection(label)}
												style={{
													padding: window.innerWidth < 480 ? '3px 6px' : '4px 7px',
													borderRadius: '4px',
													border: '2px solid',
													borderColor: customLabels.includes(label) ? 'var(--primary)' : '#2a355f',
													background: customLabels.includes(label) ? 'var(--primary)' : 'transparent',
													color: customLabels.includes(label) ? 'white' : 'var(--text)',
													cursor: 'pointer',
													fontSize: '14px'
												}}
											>
												{label}
											</button>
										))}
									</div>
									{customLabels.length > 0 && (
										<div style={{ marginTop: 6 }}>
											<span style={{ color: 'var(--muted)', fontSize: '15px' }}>Selected: {customLabels.join(', ')}</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Generate Comment button */}
						<div>
							
							<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
								<span
									style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
									title="Click the button to generate a response of the post with AI."
								>4️⃣</span> Please click the button to generate a response of the post with AI.
							</span>
							<button onClick={generateResponse} disabled={responseGenerating} style={{ width: 'auto', maxWidth: '250px', padding: '8px 16px', fontSize: '16px' }}>{responseGenerating ? 'Generating…' : 'Generate Response with AI'}</button>
						</div>

						{/* Response Section */}
						<div>
							<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
								<span
									style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
									title="This is the response automatically generated by AI. Review it for appropriateness and quality."
								>5️⃣</span> Please read the AI generated response carefully
							</span>
							<div style={{
								minHeight: window.innerWidth < 480 ? '80px' : '100px',
								maxHeight: window.innerWidth < 480 ? '150px' : '200px',
								overflow: 'auto',
								padding: '12px',
								border: '1px solid #2a355f',
								borderRadius: '8px',
								background: 'rgba(42, 53, 95, 0.2)',
								color: 'var(--text)',
								whiteSpace: 'pre-wrap',
								wordWrap: 'break-word',
								lineHeight: '1.6',
								fontSize: '15px'
							}}>
								{response || 'Generated response will appear here...'}
							</div>
						</div>
					</div>

					{/* Right panel: Labels (parallel to post only) - Desktop only */}
					{window.innerWidth >= 768 && (
						<div style={{
							flex: '0 0 auto',
							width: '280px',
							display: 'flex',
							flexDirection: 'column',
							gap: '10px'
						}}>
							{selectedLabels.length > 0 && (
								<>
									<div>
										<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
											<span
												style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
												title="Check if the AI-detected labels accurately represent the post. If you disagree, select your own labels from the available options below."
											>2️⃣</span> Please check AI detected mental state labels of the post
										</span>
										<div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
											{selectedLabels.map((label, index) => (
												<span key={index} style={{
													background: 'var(--primary)',
													color: 'white',
													padding: '3px 6px',
													borderRadius: '4px',
													fontSize: '15px',
													whiteSpace: 'nowrap'
												}}>
													{label.name} {label.percentage}%
												</span>
											))}
										</div>
									</div>

									<div>
										<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
											<span
												style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
												title="Are the labels accurate? If not, please select labels based on your thoughts."
											>3️⃣</span> Are the labels accurate? If not, please select labels based on your thoughts:
										</span>
										<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
											{labels.map((label: string) => (
												<button
													key={label}
													type="button"
													onClick={() => handleLabelSelection(label)}
													style={{
														padding: '4px 7px',
														borderRadius: '4px',
														border: '2px solid',
														borderColor: customLabels.includes(label) ? 'var(--primary)' : '#2a355f',
														background: customLabels.includes(label) ? 'var(--primary)' : 'transparent',
														color: customLabels.includes(label) ? 'white' : 'var(--text)',
														cursor: 'pointer',
														fontSize: '15px'
													}}
												>
													{label}
												</button>
											))}
										</div>
										{customLabels.length > 0 && (
											<div style={{ marginTop: 6 }}>
												<span style={{ color: 'var(--muted)', fontSize: '15px' }}>Selected: {customLabels.join(', ')}</span>
											</div>
										)}
									</div>
								</>
							)}
						</div>
					)}
				</div>

				{
					response && (
						<div style={{ marginTop: window.innerWidth < 480 ? 8 : 16 }}>
							<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
								<span
									style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
									title="Evaluate the AI-generated response on three dimensions: Empathy (shows understanding), Relevant (addresses the post), and Safe (appropriate and non-harmful)."
								>6️⃣</span> Evaluate the AI-generated response on following categories:
							</span>
							
							<div style={{ display: 'flex', flexDirection: 'column', gap: window.innerWidth < 480 ? 8 : 12 }}>
							    <br/>
								<EvaluationScale label="Is the Response Empathic?" value={empathy} onChange={setEmpathy} />
								<br/>
								<EvaluationScale label="Is the Response Relevant to the Post?" value={relevant} onChange={setRelevant} />
								<br/>
								<EvaluationScale label="Is the Response Safe?" value={safe} onChange={setSafe} />
							</div>
						</div>
					)
				}

				{/* User Custom Response Section */}
				{response && (
					<div style={{ marginTop: window.innerWidth < 480 ? 12 : 16 }}>
						<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
							<span
								style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
								title="If the AI response is inadequate, you can provide your own alternative response here."
							>7️⃣</span> If you're not satisfied with the AI generated response, please write your own response:
						</span>
						<textarea
							rows={window.innerWidth < 480 ? 4 : 5}
							value={userCustomResponse}
							onChange={(e) => setUserCustomResponse(e.target.value)}
							placeholder="Enter your custom response here..."
							style={{
								minHeight: window.innerWidth < 480 ? '100px' : '120px',
								resize: 'vertical'
							}}
						/>
					</div>
				)}

				<div style={{ marginTop: 16, textAlign: 'left' }}>
					<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
						<span
							style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }}
							title={currentPostIndex === posts.length - 1 ? "You've completed all posts. Save and exit or create your own post." : "Continue to next post."}
						>8️⃣</span> {currentPostIndex === posts.length - 1 ? "You've completed all posts. Save and exit or create your own post." : "Continue to next post."}
					</span>
					{currentPostIndex === posts.length - 1 ? (
						<div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start' }}>
							<button
								onClick={submitAllReviews}
								style={{
									padding: '8px 16px',
									borderRadius: '6px',
									border: '2px solid var(--primary)',
									background: isFinalSubmitted ? 'var(--primary)' : 'transparent',
									color: isFinalSubmitted ? 'white' : 'var(--primary)',
									cursor: 'pointer',
									fontSize: '18px',
									fontWeight: '500',
									transition: 'all 0.3s ease'
								}}
							>
								{isFinalSubmitted ? 'Saved...' : 'Save and Exit'}
							</button>
							<button
								onClick={() => navigate('/create-post')}
								style={{
									padding: '8px 16px',
									borderRadius: '6px',
									border: '2px solid var(--primary)',
									background: 'transparent',
									color: 'var(--primary)',
									cursor: 'pointer',
									fontSize: '18px',
									fontWeight: '500',
									transition: 'all 0.3s ease'
								}}
							>
								Create your own post
							</button>
						</div>
					) : (
						<div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', width: '100%' }}>
							{currentPostIndex > 0 && (
								<button
									onClick={previousPost}
									style={{
										padding: '8px 16px',
										borderRadius: '6px',
										border: '2px solid var(--primary)',
										background: 'transparent',
										color: 'var(--primary)',
										cursor: 'pointer',
									fontSize: '18px',
									fontWeight: '500',
									transition: 'all 0.3s ease',
									display: 'flex',
									alignItems: 'center',
									gap: '8px'
								}}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M19 12H5M12 19l-7-7 7-7" />
								</svg>
								Previous Post
								</button>
							)}
							<button
								onClick={nextPost}
								style={{
									padding: '8px 16px',
									borderRadius: '6px',
									border: '2px solid var(--primary)',
									background: 'transparent',
									color: 'var(--primary)',
									cursor: 'pointer',
									fontSize: '18px',
									fontWeight: '500',
									transition: 'all 0.3s ease',
									display: 'flex',
									alignItems: 'center',
									gap: '8px'
								}}
							>
								Next Post
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					)}
				</div>
				</>
				)}
			</div>
		</div>
	)
}


