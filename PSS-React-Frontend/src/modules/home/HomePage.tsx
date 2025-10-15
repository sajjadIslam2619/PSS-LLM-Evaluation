import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import labels from './labels.json'
import comments from './comments.json'

export const HomePage: React.FC = () => {
	const { username, logout } = useAuth()
	const [post, setPost] = useState('')
	const [comment, setComment] = useState('')
	const [selectedLabels, setSelectedLabels] = useState<{name: string, percentage: number}[]>([])
	const [empathy, setEmpathy] = useState(0)
	const [relevant, setRelevant] = useState(0)
	const [safe, setSafe] = useState(0)
	const [isSatisfiedWithLabels, setIsSatisfiedWithLabels] = useState<boolean | null>(null)
	const [customLabels, setCustomLabels] = useState<string[]>([])
	const [isSubmitted, setIsSubmitted] = useState(false)

	const classifyPost = () => {
		if (!post.trim()) {
			alert('Please enter a post first')
			return
		}
		
		// Select 2 random labels with random percentages
		const shuffled = [...labels].sort(() => 0.5 - Math.random())
		const randomLabels = shuffled.slice(0, 2).map(label => ({
			name: label,
			percentage: Math.floor(Math.random() * 50) + 20 // Random percentage between 20-70%
		}))
		setSelectedLabels(randomLabels)
	}

	const generateComment = () => {
		if (!post.trim()) {
			alert('Please enter a post first')
			return
		}
		
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

	const submitReview = () => {
		const warnings = []
		
		if (!post.trim()) {
			warnings.push('Please enter a post')
		}
		
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
		
		if (empathy === 0 && relevant === 0 && safe === 0) {
			warnings.push('Please evaluate the generated comment')
		}
		
		if (warnings.length > 0) {
			alert('Please complete the following:\n• ' + warnings.join('\n• '))
			return
		}
		
		// Success - set submitted state to change button color
		setIsSubmitted(true)
		
		// Clear all fields for next review after a short delay
		setTimeout(() => {
			setPost('')
			setComment('')
			setSelectedLabels([])
			setEmpathy(0)
			setRelevant(0)
			setSafe(0)
			setIsSatisfiedWithLabels(null)
			setCustomLabels([])
			setIsSubmitted(false)
		}, 2000)
	}

	const EvaluationScale: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
		<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
			<span style={{ minWidth: '80px', fontSize: '14px', color: 'var(--muted)' }}>{label}:</span>
			<div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
				{[1, 2, 3, 4, 5].map((num) => (
					<button
						key={num}
						type="button"
						onClick={() => onChange(num)}
						style={{
							width: '32px',
							height: '32px',
							borderRadius: '50%',
							border: '2px solid',
							borderColor: value === num ? 'var(--primary)' : '#2a355f',
							background: value === num ? 'var(--primary)' : 'transparent',
							color: value === num ? 'white' : 'var(--text)',
							cursor: 'pointer',
							fontSize: '12px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						{num}
					</button>
				))}
				<button
					type="button"
					onClick={() => onChange(0)}
					style={{
						padding: '6px 12px',
						borderRadius: '16px',
						border: '2px solid',
						borderColor: value === 0 ? 'var(--primary)' : '#2a355f',
						background: value === 0 ? 'var(--primary)' : 'transparent',
						color: value === 0 ? 'white' : 'var(--text)',
						cursor: 'pointer',
						fontSize: '12px',
						marginLeft: '8px'
					}}
				>
					Not sure
				</button>
			</div>
		</div>
	)

	return (
		<div className="container">
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<h1 style={{ margin: 0 }}>Welcome,</h1>
					<span style={{ 
						color: 'var(--primary)', 
						fontSize: '24px', 
						fontWeight: '600',
						textTransform: 'capitalize'
					}}>
						{username}
					</span>
				</div>
				<button onClick={logout} style={{ padding: '6px 12px', fontSize: '14px' }}>Logout</button>
			</div>

			<div className="card">
				<label>
					<span>Post</span>
					<textarea rows={6} value={post} onChange={(e) => setPost(e.target.value)} placeholder="Write your post here..." />
				</label>
				<div style={{ display: 'flex', gap: 8 }}>
					<button onClick={classifyPost}>Classify post</button>
					<button onClick={generateComment}>Generate comment</button>
				</div>
				
				{selectedLabels.length > 0 && (
					<div style={{ marginTop: 12 }}>
						<span style={{ color: 'var(--muted)', fontSize: '14px' }}>Detected labels:</span>
						<div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
							{selectedLabels.map((label, index) => (
								<span key={index} style={{ 
									background: 'var(--primary)', 
									color: 'white', 
									padding: '4px 8px', 
									borderRadius: '4px', 
									fontSize: '12px' 
								}}>
									{label.name} {label.percentage}%
								</span>
							))}
						</div>
						
						<div style={{ marginTop: 12 }}>
							<span style={{ color: 'var(--muted)', fontSize: '14px' }}>Are you satisfied with detected labels?</span>
							<div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
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
										fontSize: '12px'
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
										fontSize: '12px'
									}}
								>
									No
								</button>
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
					<div style={{ marginTop: 16, padding: 12, background: '#0f1730', borderRadius: '8px', border: '1px solid #2a355f' }}>
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
						<button 
							onClick={submitReview}
							style={{
								padding: '8px 16px',
								borderRadius: '6px',
								border: '2px solid var(--primary)',
								background: isSubmitted ? 'var(--primary)' : 'transparent',
								color: isSubmitted ? 'white' : 'var(--primary)',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: '500',
								transition: 'all 0.3s ease'
							}}
						>
							{isSubmitted ? 'Submitted!' : 'Submit Review'}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}


