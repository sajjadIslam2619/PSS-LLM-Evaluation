import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import labels from './labels.json'
import comments from './comments.json'
import demoPosts from './demoPosts.json'

export const HomePage: React.FC = () => {
	const navigate = useNavigate()
	const { username, logout } = useAuth()
	const [currentPostIndex, setCurrentPostIndex] = useState(0)
	const [post, setPost] = useState(demoPosts[0].content)
	const [comment, setComment] = useState('')
	const [selectedLabels, setSelectedLabels] = useState<{ name: string, percentage: number }[]>([])
	const [empathy, setEmpathy] = useState<string>('')
	const [relevant, setRelevant] = useState<string>('')
	const [safe, setSafe] = useState<string>('')
	const [isSatisfiedWithLabels, setIsSatisfiedWithLabels] = useState<boolean | null>(null)
	const [customLabels, setCustomLabels] = useState<string[]>([])
	//const [isSubmitted, setIsSubmitted] = useState(false)
	//const [allPostsCompleted, setAllPostsCompleted] = useState(false)
	const [isFinalSubmitted, setIsFinalSubmitted] = useState(false)

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

	const generateComment = () => {
		// Select a random comment
		const randomComment = comments[Math.floor(Math.random() * comments.length)]
		setComment(randomComment)
	}

	const handleLabelSelection = (label: string) => {
		if (customLabels.includes(label)) {
			setCustomLabels(customLabels.filter(l => l !== label))
		} else {
			setCustomLabels([...customLabels, label])
		}
	}

	const validateCurrentPost = () => {
		const warnings = []

		if (selectedLabels.length === 0 && customLabels.length === 0) {
			warnings.push('Please classify the post')
		}

		// Check if user selected "No" for satisfaction but didn't select custom labels
		if (isSatisfiedWithLabels === false && customLabels.length === 0) {
			warnings.push('Please select labels since you are not satisfied with detected labels')
		}

		if (!comment.trim()) {
			warnings.push('Please generate a comment')
		}

		if (empathy === '' || relevant === '' || safe === '') {
			warnings.push('Please evaluate all three categories (Empathy, Relevant, Safe)')
		}

		return warnings
	}

	const nextPost = () => {
		const warnings = validateCurrentPost()

		if (warnings.length > 0) {
			alert('Please complete the following:\n• ' + warnings.join('\n• '))
			return
		}

		// Move to next post
		if (currentPostIndex < demoPosts.length - 1) {
			const nextIndex = currentPostIndex + 1
			setCurrentPostIndex(nextIndex)
			setPost(demoPosts[nextIndex].content)
			// Reset all fields for next post
			setComment('')
			setSelectedLabels([])
			setEmpathy('')
			setRelevant('')
			setSafe('')
			setIsSatisfiedWithLabels(null)
			setCustomLabels([])
			//setIsSubmitted(false)
		} else {
			// All posts completed
			//setAllPostsCompleted(true)
		}
	}

	const submitAllReviews = () => {
		const warnings = validateCurrentPost()

		if (warnings.length > 0) {
			alert('Please complete the following:\n• ' + warnings.join('\n• '))
			return
		}

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
				<span style={{ fontSize: isMobile ? '12px' : '14px', color: 'var(--muted)' }}>{label}:</span>
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
								fontSize: isMobile ? '12px' : '13px',
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
					<h1 style={{ margin: 0, fontSize: window.innerWidth < 480 ? '18px' : '24px' }}>Welcome,</h1>
					<span style={{
						color: 'var(--primary)',
						fontSize: window.innerWidth < 480 ? '16px' : '24px',
						fontWeight: '600',
						textTransform: 'capitalize'
					}}>
						{username}
					</span>
				</div>
				<button onClick={logout} style={{
					padding: window.innerWidth < 480 ? '8px 12px' : '6px 12px',
					fontSize: window.innerWidth < 480 ? '13px' : '14px',
					alignSelf: window.innerWidth < 480 ? 'flex-start' : 'center'
				}}>Logout</button>
			</div>

			<div className="card">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: window.innerWidth < 480 ? 8 : 16 }}>
					<h2 style={{ margin: 0, fontSize: window.innerWidth < 480 ? '16px' : '18px' }}>Post {currentPostIndex + 1} of {demoPosts.length}</h2>
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
						<label>
							<span>Post</span>
							<textarea
								rows={window.innerWidth < 480 ? 8 : 15}
								value={post}
								onChange={(e) => setPost(e.target.value)}
								placeholder="Write your post here..."
								style={{
									minHeight: window.innerWidth < 480 ? '200px' : '400px',
									resize: 'vertical'
								}}
							/>
						</label>

						{/* Labels section for mobile - appears after post */}
						{window.innerWidth < 768 && selectedLabels.length > 0 && (
							<div style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '10px'
							}}>
								<div>
									<span style={{ color: 'var(--muted)', fontSize: window.innerWidth < 480 ? '12px' : '13px', fontWeight: '500' }}>Detected labels:</span>
									<div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
										{selectedLabels.map((label, index) => (
											<span key={index} style={{
												background: 'var(--primary)',
												color: 'white',
												padding: '3px 6px',
												borderRadius: '4px',
												fontSize: window.innerWidth < 480 ? '10px' : '11px',
												whiteSpace: 'nowrap'
											}}>
												{label.name} {label.percentage}%
											</span>
										))}
									</div>
								</div>

								<div>
									<div style={{
										display: 'flex',
										flexDirection: 'column',
										gap: '6px'
									}}>
										<span style={{
											color: 'var(--muted)',
											fontSize: window.innerWidth < 480 ? '10px' : '11px',
											fontWeight: '500'
										}}>Are you satisfied with detected labels?</span>
										<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
											<button
												type="button"
												onClick={() => setIsSatisfiedWithLabels(true)}
												style={{
													padding: window.innerWidth < 480 ? '6px 10px' : '6px 12px',
													borderRadius: '4px',
													border: '2px solid',
													borderColor: isSatisfiedWithLabels === true ? 'var(--primary)' : '#2a355f',
													background: isSatisfiedWithLabels === true ? 'var(--primary)' : 'transparent',
													color: isSatisfiedWithLabels === true ? 'white' : 'var(--text)',
													cursor: 'pointer',
													fontSize: window.innerWidth < 480 ? '11px' : '12px',
													fontWeight: '500',
													flex: '1',
													minWidth: '50px'
												}}
											>
												Yes
											</button>
											<button
												type="button"
												onClick={() => setIsSatisfiedWithLabels(false)}
												style={{
													padding: window.innerWidth < 480 ? '6px 10px' : '6px 12px',
													borderRadius: '4px',
													border: '2px solid',
													borderColor: isSatisfiedWithLabels === false ? 'var(--primary)' : '#2a355f',
													background: isSatisfiedWithLabels === false ? 'var(--primary)' : 'transparent',
													color: isSatisfiedWithLabels === false ? 'white' : 'var(--text)',
													cursor: 'pointer',
													fontSize: window.innerWidth < 480 ? '11px' : '12px',
													fontWeight: '500',
													flex: '1',
													minWidth: '50px'
												}}
											>
												No
											</button>
										</div>
									</div>
								</div>

								{isSatisfiedWithLabels === false && (
									<div>
										<span style={{ color: 'var(--muted)', fontSize: window.innerWidth < 480 ? '12px' : '13px', fontWeight: '500' }}>Select labels:</span>
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
														fontSize: window.innerWidth < 480 ? '10px' : '11px'
													}}
												>
													{label}
												</button>
											))}
										</div>
										{customLabels.length > 0 && (
											<div style={{ marginTop: 6 }}>
												<span style={{ color: 'var(--muted)', fontSize: window.innerWidth < 480 ? '10px' : '11px' }}>Selected: {customLabels.join(', ')}</span>
											</div>
										)}
									</div>
								)}
							</div>
						)}

						{/* Generate Comment button */}
						<div>
							<button onClick={generateComment} style={{ width: '100%', maxWidth: '200px' }}>Generate comment</button>
						</div>

						{/* Comment Section */}
						<label>
							<span>Comment</span>
							<textarea
								rows={window.innerWidth < 480 ? 3 : 4}
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder="Generated comment will appear here..."
								style={{
									minHeight: window.innerWidth < 480 ? '60px' : 'auto',
									maxHeight: window.innerWidth < 480 ? '100px' : 'auto'
								}}
							/>
						</label>
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
										<span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: '500' }}>Detected labels:</span>
										<div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
											{selectedLabels.map((label, index) => (
												<span key={index} style={{
													background: 'var(--primary)',
													color: 'white',
													padding: '3px 6px',
													borderRadius: '4px',
													fontSize: '11px',
													whiteSpace: 'nowrap'
												}}>
													{label.name} {label.percentage}%
												</span>
											))}
										</div>
									</div>

									<div>
										<div style={{
											display: 'flex',
											flexDirection: 'column',
											gap: '6px'
										}}>
											<span style={{
												color: 'var(--muted)',
												fontSize: '11px',
												fontWeight: '500'
											}}>Are you satisfied with detected labels?</span>
											<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
												<button
													type="button"
													onClick={() => setIsSatisfiedWithLabels(true)}
													style={{
														padding: '6px 12px',
														borderRadius: '4px',
														border: '2px solid',
														borderColor: isSatisfiedWithLabels === true ? 'var(--primary)' : '#2a355f',
														background: isSatisfiedWithLabels === true ? 'var(--primary)' : 'transparent',
														color: isSatisfiedWithLabels === true ? 'white' : 'var(--text)',
														cursor: 'pointer',
														fontSize: '12px',
														fontWeight: '500',
														flex: '1',
														minWidth: '50px'
													}}
												>
													Yes
												</button>
												<button
													type="button"
													onClick={() => setIsSatisfiedWithLabels(false)}
													style={{
														padding: '6px 12px',
														borderRadius: '4px',
														border: '2px solid',
														borderColor: isSatisfiedWithLabels === false ? 'var(--primary)' : '#2a355f',
														background: isSatisfiedWithLabels === false ? 'var(--primary)' : 'transparent',
														color: isSatisfiedWithLabels === false ? 'white' : 'var(--text)',
														cursor: 'pointer',
														fontSize: '12px',
														fontWeight: '500',
														flex: '1',
														minWidth: '50px'
													}}
												>
													No
												</button>
											</div>
										</div>
									</div>

									{isSatisfiedWithLabels === false && (
										<div>
											<span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: '500' }}>Select labels:</span>
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
															fontSize: '11px'
														}}
													>
														{label}
													</button>
												))}
											</div>
											{customLabels.length > 0 && (
												<div style={{ marginTop: 6 }}>
													<span style={{ color: 'var(--muted)', fontSize: '11px' }}>Selected: {customLabels.join(', ')}</span>
												</div>
											)}
										</div>
									)}
								</>
							)}
						</div>
					)}
				</div>

				{comment && (
					<div style={{ marginTop: window.innerWidth < 480 ? 8 : 16 }}>
						<h3 style={{ margin: '0 0 8px 0', fontSize: window.innerWidth < 480 ? '14px' : '16px', color: 'var(--text)' }}>Generated Comment Evaluation</h3>
						<div style={{ display: 'flex', flexDirection: 'column', gap: window.innerWidth < 480 ? 8 : 12 }}>
							<EvaluationScale label="Empathy" value={empathy} onChange={setEmpathy} />
							<EvaluationScale label="Relevant" value={relevant} onChange={setRelevant} />
							<EvaluationScale label="Safe" value={safe} onChange={setSafe} />
						</div>
					</div>
				)}

				{comment && (
					<div style={{ marginTop: 16, textAlign: 'center' }}>
						{currentPostIndex === demoPosts.length - 1 ? (
							<button
								onClick={submitAllReviews}
								style={{
									padding: '8px 16px',
									borderRadius: '6px',
									border: '2px solid var(--primary)',
									background: isFinalSubmitted ? 'var(--primary)' : 'transparent',
									color: isFinalSubmitted ? 'white' : 'var(--primary)',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '500',
									transition: 'all 0.3s ease'
								}}
							>
								{isFinalSubmitted ? 'Submitted!' : 'Submit All Reviews'}
							</button>
						) : (
							<button
								onClick={nextPost}
								style={{
									padding: '8px 16px',
									borderRadius: '6px',
									border: '2px solid var(--primary)',
									background: 'transparent',
									color: 'var(--primary)',
									cursor: 'pointer',
									fontSize: '14px',
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
						)}
					</div>
				)}
			</div>
		</div>
	)
}


