import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'

export const ThankYouPage: React.FC = () => {
	//const { username, logout } = useAuth()
	const { logout } = useAuth()
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [rating, setRating] = useState<number>(0)
	const [feedback, setFeedback] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [hoveredRating, setHoveredRating] = useState<number>(0)

	const handleLogout = () => {
		setIsLoggingOut(true)
		setTimeout(() => {
			logout()
		}, 1000)
	}

	const handleSubmitFeedback = () => {
		console.log('Feedback submitted:', { rating, feedback })
		setIsSubmitted(true)
	}

	const renderStars = () => {
		return [1, 2, 3, 4, 5].map((star) => (
			<span
				key={star}
				style={{
					cursor: 'pointer',
					fontSize: '32px',
					color: (hoveredRating || rating) >= star ? '#FFD700' : '#e0e0e0', // Gold or Gray
					transition: 'color 0.2s',
				}}
				onMouseEnter={() => setHoveredRating(star)}
				onMouseLeave={() => setHoveredRating(0)}
				onClick={() => setRating(star)}
			>
				★
			</span>
		))
	}

	return (
		<div className="container">
			<div style={{ textAlign: 'center', marginBottom: 24, padding: '0 20px', maxWidth: '600px', margin: '0 auto' }}>
				<h1 style={{ fontSize: '32px', margin: '0 0 16px 0', color: 'var(--primary)' }}>Thank You!</h1>
				{/* <p style={{ color: 'var(--muted)', fontSize: '18px', margin: '0 0 24px 0' }}>
					Thank you for completing the evaluation, {username}!
				</p> */}
				<p style={{ color: 'var(--text)', fontSize: '16px', margin: '0 0 32px 0' }}>
					Your feedback has been successfully submitted.
				</p>

				{!isSubmitted ? (
					<div style={{
						background: 'var(--bg-card)',
						padding: '24px',
						borderRadius: '12px',
						boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
						marginBottom: '32px',
						border: '1px solid var(--border)'
					}}>
						<h3 style={{ margin: '0 0 16px 0', color: 'var(--text)' }}>Please rate the system usability. Your feedback helps us improve the experience.</h3>

						<div style={{ marginBottom: '20px' }}>
							{renderStars()}
						</div>

						<textarea
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
							placeholder="Please share your thoughts..."
							style={{
								width: '100%',
								minHeight: '100px',
								padding: '12px',
								borderRadius: '8px',
								border: '2px solid var(--muted)', // Using muted variable (#aab0c0) for high visibility
								background: 'var(--bg)', // Reverting to standard background or keeping consistent
								color: 'var(--text)',
								fontSize: '16px',
								marginBottom: '16px',
								resize: 'vertical',
								fontFamily: 'inherit'
							}}
						/>

						<button
							onClick={handleSubmitFeedback}
							disabled={rating === 0}
							style={{
								padding: '8px 16px',
								borderRadius: '6px',
								background: 'transparent', // Always transparent to match Logout initial state
								color: rating === 0 ? 'var(--muted)' : 'var(--primary)',
								border: rating === 0 ? '2px solid var(--muted)' : '2px solid var(--primary)',
								cursor: rating === 0 ? 'not-allowed' : 'pointer',
								fontSize: '14px',
								fontWeight: '500',
								transition: 'all 0.3s ease',
								marginTop: '16px' // Added margin for spacing
							}}
						>
							Submit Feedback
						</button>
					</div>
				) : (
					<div style={{
						padding: '16px',
						background: 'rgba(76, 175, 80, 0.1)',
						borderRadius: '8px',
						marginBottom: '32px',
						color: '#ffffffff'
					}}>
						<p style={{ margin: 0, fontWeight: '500' }}>Thank you for your rating and feedback!</p>
					</div>
				)}

				<button
					onClick={handleLogout}
					style={{
						padding: '8px 16px',
						borderRadius: '6px',
						border: '2px solid var(--primary)',
						background: isLoggingOut ? 'var(--primary)' : 'transparent',
						color: isLoggingOut ? 'white' : 'var(--primary)',
						cursor: 'pointer',
						fontSize: '14px',
						fontWeight: '500',
						transition: 'all 0.3s ease'
					}}
				>
					{isLoggingOut ? 'Logging out...' : 'Logout'}
				</button>
			</div>
		</div>
	)
}
