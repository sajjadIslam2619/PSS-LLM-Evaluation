import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import labels from './labels.json'
import comments from './comments.json'
import demoPosts from './demoPosts.json'

export const HomePage: React.FC = () => {
	const navigate = useNavigate()
	//const { username, logout } = useAuth()
	const { logout } = useAuth()
	const [currentPostIndex, setCurrentPostIndex] = useState(0)
	const [post, setPost] = useState(demoPosts[0].content)
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



	// Auto-classify post when it loads
	useEffect(() => {
		classifyPost()
	}, [currentPostIndex])

	const classifyPost = () => {
		// Select 2 random labels with random percentages
		const shuffled = [...labels].sort(() => 0.5 - Math.random())
		const randomLabels = shuffled.slice(0, 2).map(label => ({
			name: label,
			percentage: Math.floor(Math.random() * 50) + 20 // Random percentage between 20-70%
		}))
		setSelectedLabels(randomLabels)
	}

	const generateResponse = () => {
		// Select a random response
		const randomResponse = comments[Math.floor(Math.random() * comments.length)]
		setResponse(randomResponse)
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

	const previousPost = () => {
		if (currentPostIndex > 0) {
			const prevIndex = currentPostIndex - 1
			setCurrentPostIndex(prevIndex)
			setPost(demoPosts[prevIndex].content)
			// Reset fields for now (simpler than persisting state)
			setResponse('')
			setUserCustomResponse('')
			setSelectedLabels([])
			setEmpathy('')
			setRelevant('')
			setSafe('')
			// setIsSatisfiedWithLabels(null)
			setCustomLabels([])
		}
	}

	const nextPost = () => {
		//const warnings = validateCurrentPost()

		// if (warnings.length > 0) {
		// 	alert('Please complete the following:\n• ' + warnings.join('\n• '))
		// 	return
		// }

		// Move to next post
		if (currentPostIndex < demoPosts.length - 1) {
			const nextIndex = currentPostIndex + 1
			setCurrentPostIndex(nextIndex)
			setPost(demoPosts[nextIndex].content)
			// Reset all fields for next post
			setResponse('')
			setUserCustomResponse('')
			setSelectedLabels([])
			setEmpathy('')
			setRelevant('')
			setSafe('')
			// setIsSatisfiedWithLabels(null)
			setCustomLabels([])
			//setIsSubmitted(false)
		} else {
			// All posts completed
			//setAllPostsCompleted(true)
		}
	}

	const submitAllReviews = () => {
		//const warnings = validateCurrentPost()

		// if (warnings.length > 0) {
		// 	alert('Please complete the following:\n• ' + warnings.join('\n• '))
		// 	return
		// }

		// Set submitted state to change button color
		setIsFinalSubmitted(true)

		// Navigate to thank you page after a short delay
		setTimeout(() => {
			navigate('/thank-you')
		}, 1500)
	}





	const EvaluationScale: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => {
		const options = ['Agree', 'Somewhat Agree', 'Neutral', 'Somewhat Disagree', 'Disagree', 'Not Applicable']
		const isMobile = window.innerWidth < 480

		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 4 : 8 }}>
				<span style={{ fontSize: isMobile ? '14px' : '16px', color: 'var(--muted)' }}>{label}:</span>
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
								fontSize: isMobile ? '13px' : '14px',
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
					<h1 style={{ margin: 0, fontSize: window.innerWidth < 480 ? '20px' : '28px' }}>Welcome!!</h1>
					<span style={{
						color: 'var(--primary)',
						fontSize: window.innerWidth < 480 ? '18px' : '28px',
						fontWeight: '600',
						textTransform: 'capitalize'
					}}>
						{/* {username} */}
					</span>
				</div>
				<button onClick={logout} style={{
					padding: window.innerWidth < 480 ? '8px 12px' : '6px 12px',
					fontSize: window.innerWidth < 480 ? '14px' : '15px',
					alignSelf: window.innerWidth < 480 ? 'flex-start' : 'center'
				}}>Logout</button>
			</div>

			<div className="card">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: window.innerWidth < 480 ? 8 : 16 }}>
					<h2 style={{ margin: 0, fontSize: window.innerWidth < 480 ? '18px' : '20px' }}>Social Media Post {currentPostIndex + 1} of {demoPosts.length}</h2>
				</div>

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
								Social Media Post
								<span
									style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 1.0 }}
									title="This is the social media post content that you will be reviewing and evaluating."
								>ℹ️</span>
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
								fontSize: window.innerWidth < 480 ? '14px' : '15px'
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
									<span style={{ color: 'var(--muted)', fontSize: window.innerWidth < 480 ? '14px' : '15px', fontWeight: '500' }}>
										AI Detected Labels:
										<span
											style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 0.7 }}
											title="These are labels automatically detected by AI. Review them to see if they accurately categorize the post."
										>ℹ️</span>
									</span>
									<div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
										{selectedLabels.map((label, index) => (
											<span key={index} style={{
												background: 'var(--primary)',
												color: 'white',
												padding: '3px 6px',
												borderRadius: '4px',
												fontSize: window.innerWidth < 480 ? '12px' : '13px',
												whiteSpace: 'nowrap'
											}}>
												{label.name} {label.percentage}%
											</span>
										))}
									</div>
								</div>

								<div>
									<span style={{
										color: 'var(--muted)',
										fontSize: window.innerWidth < 480 ? '14px' : '15px',
										fontWeight: '500',
										marginBottom: '8px',
										display: 'block'
									}}>Did your label differ from AI labels? If yes, please select labels based on your thoughts:</span>
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
										{labels.map((label) => (
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
													fontSize: window.innerWidth < 480 ? '12px' : '13px'
												}}
											>
												{label}
											</button>
										))}
									</div>
									{customLabels.length > 0 && (
										<div style={{ marginTop: 6 }}>
											<span style={{ color: 'var(--muted)', fontSize: window.innerWidth < 480 ? '12px' : '13px' }}>Selected: {customLabels.join(', ')}</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Generate Comment button */}
						<div>
							<button onClick={generateResponse} style={{ width: '100%', maxWidth: '300px' }}>Generate Response with AI</button>
						</div>

						{/* Response Section */}
						<div>
							<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
								AI Generated Response
								<span
									style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 1.0 }}
									title="This is the response automatically generated by AI. Review it for appropriateness and quality."
								>ℹ️</span>
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
								fontSize: window.innerWidth < 480 ? '14px' : '15px'
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
										<span style={{ color: 'var(--muted)', fontSize: '15px', fontWeight: '500' }}>
											AI Detected Labels:
											<span
												style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 1.0 }}
												title="These are labels automatically detected by AI. Review them to see if they accurately categorize the post."
											>ℹ️</span>
										</span>
										<div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
											{selectedLabels.map((label, index) => (
												<span key={index} style={{
													background: 'var(--primary)',
													color: 'white',
													padding: '3px 6px',
													borderRadius: '4px',
													fontSize: '13px',
													whiteSpace: 'nowrap'
												}}>
													{label.name} {label.percentage}%
												</span>
											))}
										</div>
									</div>

									<div>
										<span style={{
											color: 'var(--muted)',
											fontSize: '15px',
											fontWeight: '500',
											marginBottom: '8px',
											display: 'block'
										}}>Did your label differ from AI labels? If yes, please select labels based on your thoughts:</span>
										<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
											{labels.map((label) => (
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
														fontSize: '13px'
													}}
												>
													{label}
												</button>
											))}
										</div>
										{customLabels.length > 0 && (
											<div style={{ marginTop: 6 }}>
												<span style={{ color: 'var(--muted)', fontSize: '13px' }}>Selected: {customLabels.join(', ')}</span>
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
							<h3 style={{ margin: '0 0 8px 0', fontSize: window.innerWidth < 480 ? '16px' : '18px', color: 'var(--text)' }}>
								Please evaluate the AI-generated response:
								<span
									style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 1.0 }}
									title="Evaluate the AI-generated response on three dimensions: Empathy (shows understanding), Relevant (addresses the post), and Safe (appropriate and non-harmful)."
								>ℹ️</span>
							</h3>
							<div style={{ display: 'flex', flexDirection: 'column', gap: window.innerWidth < 480 ? 8 : 12 }}>
								<EvaluationScale label="Empathy" value={empathy} onChange={setEmpathy} />
								<EvaluationScale label="Relevant" value={relevant} onChange={setRelevant} />
								<EvaluationScale label="Safe" value={safe} onChange={setSafe} />
							</div>
						</div>
					)
				}

				{/* User Custom Response Section */}
				{response && (
					<div style={{ marginTop: window.innerWidth < 480 ? 12 : 16 }}>
						<span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500', fontSize: window.innerWidth < 480 ? '14px' : '15px' }}>
							If you are not satisfied with the AI generated response, please enter your own response:
							<span
								style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 1.0 }}
								title="If the AI response is inadequate, you can provide your own alternative response here."
							>ℹ️</span>
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
					{currentPostIndex === demoPosts.length - 1 ? (
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
									fontSize: '16px',
									fontWeight: '500',
									transition: 'all 0.3s ease'
								}}
							>
								{isFinalSubmitted ? 'Saved...' : 'Save and Exit'}
							</button>
							<button
								onClick={() => navigate('/curate-post')}
								style={{
									padding: '8px 16px',
									borderRadius: '6px',
									border: '2px solid var(--primary)',
									background: 'transparent',
									color: 'var(--primary)',
									cursor: 'pointer',
									fontSize: '16px',
									fontWeight: '500',
									transition: 'all 0.3s ease'
								}}
							>
								Curate your own post
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
										fontSize: '16px',
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
									fontSize: '16px',
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
			</div>
		</div>
	)
}


