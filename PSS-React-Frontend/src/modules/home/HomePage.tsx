import React, { useState } from 'react'
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
	const [selectedLabels, setSelectedLabels] = useState<{name: string, percentage: number}[]>([])
	const [empathy, setEmpathy] = useState<string>('')
	const [relevant, setRelevant] = useState<string>('')
	const [safe, setSafe] = useState<string>('')
	const [isSatisfiedWithLabels, setIsSatisfiedWithLabels] = useState<boolean | null>(null)
	const [customLabels, setCustomLabels] = useState<string[]>([])
	//const [isSubmitted, setIsSubmitted] = useState(false)
	//const [allPostsCompleted, setAllPostsCompleted] = useState(false)
	const [isFinalSubmitted, setIsFinalSubmitted] = useState(false)

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
		const options = ['Agree', 'Neutral', 'Disagree']
		
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				<span style={{ fontSize: '14px', color: 'var(--muted)' }}>{label}:</span>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
					{options.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => onChange(option)}
							style={{
								padding: '8px 12px',
								borderRadius: '6px',
								border: '2px solid',
								borderColor: value === option ? 'var(--primary)' : '#2a355f',
								background: value === option ? 'var(--primary)' : 'transparent',
								color: value === option ? 'white' : 'var(--text)',
								cursor: 'pointer',
								fontSize: '13px',
								fontWeight: '500',
								minWidth: '80px',
								flex: '1',
								maxWidth: '120px'
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
				gap: window.innerWidth < 480 ? '12px' : '0',
				marginBottom: 16 
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
					<h1 style={{ margin: 0, fontSize: window.innerWidth < 480 ? '20px' : '24px' }}>Welcome,</h1>
					<span style={{ 
						color: 'var(--primary)', 
						fontSize: window.innerWidth < 480 ? '18px' : '24px', 
						fontWeight: '600',
						textTransform: 'capitalize'
					}}>
						{username}
					</span>
				</div>
				<button onClick={logout} style={{ 
					padding: window.innerWidth < 480 ? '8px 16px' : '6px 12px', 
					fontSize: window.innerWidth < 480 ? '14px' : '14px',
					alignSelf: window.innerWidth < 480 ? 'flex-start' : 'center'
				}}>Logout</button>
			</div>

			<div className="card">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
					<h2 style={{ margin: 0, fontSize: '18px' }}>Post {currentPostIndex + 1} of {demoPosts.length}</h2>
				</div>
				
				<label>
					<span>Post</span>
					<textarea rows={6} value={post} onChange={(e) => setPost(e.target.value)} placeholder="Write your post here..." />
				</label>
				<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
					<button onClick={classifyPost} style={{ flex: '1', minWidth: '120px' }}>Classify post</button>
					<button onClick={generateComment} style={{ flex: '1', minWidth: '120px' }}>Generate comment</button>
				</div>
				
				{selectedLabels.length > 0 && (
					<div style={{ marginTop: 12 }}>
						<span style={{ color: 'var(--muted)', fontSize: '14px' }}>Detected labels:</span>
						<div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
							{selectedLabels.map((label, index) => (
								<span key={index} style={{ 
									background: 'var(--primary)', 
									color: 'white', 
									padding: '4px 8px', 
									borderRadius: '4px', 
									fontSize: '12px',
									whiteSpace: 'nowrap'
								}}>
									{label.name} {label.percentage}%
								</span>
							))}
						</div>
						
						<div style={{ marginTop: 12 }}>
							<div style={{ 
								display: 'flex', 
								flexDirection: window.innerWidth < 768 ? 'column' : 'row',
								alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
								gap: window.innerWidth < 768 ? '8px' : '12px'
							}}>
								<span style={{ 
									color: 'var(--muted)', 
									fontSize: '12px',
									whiteSpace: 'nowrap'
								}}>Are you satisfied with detected labels?</span>
								<div style={{ display: 'flex', gap: 8 }}>
									<button
										type="button"
										onClick={() => setIsSatisfiedWithLabels(true)}
										style={{
											padding: '8px 16px',
											borderRadius: '6px',
											border: '2px solid',
											borderColor: isSatisfiedWithLabels === true ? 'var(--primary)' : '#2a355f',
											background: isSatisfiedWithLabels === true ? 'var(--primary)' : 'transparent',
											color: isSatisfiedWithLabels === true ? 'white' : 'var(--text)',
											cursor: 'pointer',
											fontSize: '13px',
											fontWeight: '500',
											minWidth: '60px'
										}}
									>
										Yes
									</button>
									<button
										type="button"
										onClick={() => setIsSatisfiedWithLabels(false)}
										style={{
											padding: '8px 16px',
											borderRadius: '6px',
											border: '2px solid',
											borderColor: isSatisfiedWithLabels === false ? 'var(--primary)' : '#2a355f',
											background: isSatisfiedWithLabels === false ? 'var(--primary)' : 'transparent',
											color: isSatisfiedWithLabels === false ? 'white' : 'var(--text)',
											cursor: 'pointer',
											fontSize: '13px',
											fontWeight: '500',
											minWidth: '60px'
										}}
									>
										No
									</button>
								</div>
							</div>
						</div>
						
						{isSatisfiedWithLabels === false && (
							<div style={{ marginTop: 12 }}>
								<span style={{ color: 'var(--muted)', fontSize: '14px' }}>Select labels:</span>
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
									{labels.map((label) => (
										<button
											key={label}
											type="button"
											onClick={() => handleLabelSelection(label)}
											style={{
												padding: '4px 8px',
												borderRadius: '4px',
												border: '2px solid',
												borderColor: customLabels.includes(label) ? 'var(--primary)' : '#2a355f',
												background: customLabels.includes(label) ? 'var(--primary)' : 'transparent',
												color: customLabels.includes(label) ? 'white' : 'var(--text)',
												cursor: 'pointer',
												fontSize: '12px'
											}}
										>
											{label}
										</button>
									))}
								</div>
								{customLabels.length > 0 && (
									<div style={{ marginTop: 8 }}>
										<span style={{ color: 'var(--muted)', fontSize: '12px' }}>Selected: {customLabels.join(', ')}</span>
									</div>
								)}
							</div>
						)}
					</div>
				)}
				
				<label>
					<span>Comment</span>
					<textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Generated comment will appear here..." />
				</label>

				{comment && (
					<div style={{ marginTop: 16 }}>
						<h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--text)' }}>Generated Comment Evaluation</h3>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
									<path d="M5 12h14M12 5l7 7-7 7"/>
								</svg>
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}


