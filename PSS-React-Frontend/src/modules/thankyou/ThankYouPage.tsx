import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { api } from '../../shared/api'

const LIKERT_OPTIONS = [
	{ value: 1, label: 'Strongly disagree' },
	{ value: 2, label: 'Disagree' },
	{ value: 3, label: 'Neutral' },
	{ value: 4, label: 'Agree' },
	{ value: 5, label: 'Strongly agree' },
]

const LikertQuestion: React.FC<{
	prompt: string
	value: number | null
	onChange: (value: number) => void
}> = ({ prompt, value, onChange }) => (
	<fieldset style={{ border: 'none', margin: '0 0 24px 0', padding: 0, textAlign: 'left' }}>
		<legend style={{ fontSize: '16px', fontWeight: 600, marginBottom: 10, color: 'var(--text)', padding: 0 }}>
			{prompt}
		</legend>
		<div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
			{LIKERT_OPTIONS.map((option) => {
				const isSelected = value === option.value
				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={isSelected}
						onClick={() => onChange(option.value)}
						style={{
							flex: '1 1 0',
							textAlign: 'center',
							padding: '10px 6px',
							borderRadius: '8px',
							border: '2px solid',
							borderColor: isSelected ? 'var(--primary)' : '#2a355f',
							background: isSelected ? 'var(--primary)' : 'transparent',
							color: isSelected ? '#0b1020' : 'var(--text)',
							fontSize: '14px',
							fontWeight: 500,
							lineHeight: 1.3,
							cursor: 'pointer',
						}}
					>
						{option.label}
					</button>
				)
			})}
		</div>
	</fieldset>
)

export const ThankYouPage: React.FC = () => {
	const { username, role, logout } = useAuth()
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [simpleToUse, setSimpleToUse] = useState<number | null>(null)
	const [overallSatisfaction, setOverallSatisfaction] = useState<number | null>(null)
	const [trustAiClassification, setTrustAiClassification] = useState<number | null>(null)
	const [comfortableAsIs, setComfortableAsIs] = useState<number | null>(null)
	const [comfortableAsDraft, setComfortableAsDraft] = useState<number | null>(null)
	const [aiMakesWorkManageable, setAiMakesWorkManageable] = useState<number | null>(null)
	const [feedback, setFeedback] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const answersMissing =
		simpleToUse === null &&
		overallSatisfaction === null &&
		trustAiClassification === null &&
		comfortableAsIs === null &&
		comfortableAsDraft === null &&
		aiMakesWorkManageable === null &&
		feedback.trim() === ''

	const handleLogout = () => {
		setIsLoggingOut(true)
		setTimeout(() => {
			logout()
		}, 1000)
	}

	const handleSubmitFeedback = async () => {
		if (!username || !role || answersMissing) return
		setIsSubmitting(true)
		try {
			await api.createFeedback({
				user_identifier: username,
				role,
				simple_to_use: simpleToUse,
				overall_satisfaction: overallSatisfaction,
				trust_ai_classification: trustAiClassification,
				comfortable_using_ai_response_as_is: comfortableAsIs,
				comfortable_using_ai_response_as_draft: comfortableAsDraft,
				ai_makes_work_manageable: aiMakesWorkManageable,
				comment: feedback.trim() || undefined,
			})
			setIsSubmitted(true)
		} catch (e) {
			console.error('Failed to submit feedback:', e)
			alert('Failed to submit feedback. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="container" style={{ maxWidth: 920 }}>
			<div style={{ textAlign: 'center', marginBottom: 24, padding: '0 20px', maxWidth: '920px', margin: '0 auto' }}>
				<h1 style={{ fontSize: '32px', margin: '0 0 32px 0', color: 'var(--primary)' }}>Thank You!</h1>

				{!isSubmitted ? (
					<div style={{
						background: 'var(--bg-card)',
						padding: '24px',
						borderRadius: '12px',
						boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
						marginBottom: '32px',
						border: '1px solid var(--border)'
					}}>
						<h3 style={{ margin: '0 0 20px 0', color: 'var(--text)', textAlign: 'center' }}>How did you like the app?</h3>

						<LikertQuestion
							prompt="It was simple to use this system."
							value={simpleToUse}
							onChange={setSimpleToUse}
						/>
						<LikertQuestion
							prompt="Overall, I am satisfied with this system."
							value={overallSatisfaction}
							onChange={setOverallSatisfaction}
						/>
						<LikertQuestion
							prompt="I would trust the AI-generated classification of a Veteran's mental state."
							value={trustAiClassification}
							onChange={setTrustAiClassification}
						/>
						<LikertQuestion
							prompt="I would feel comfortable using the AI-generated response as-is in my peer support work."
							value={comfortableAsIs}
							onChange={setComfortableAsIs}
						/>
						<LikertQuestion
							prompt="I would feel comfortable using the AI-generated response as a starting draft in my peer support work."
							value={comfortableAsDraft}
							onChange={setComfortableAsDraft}
						/>
						<LikertQuestion
							prompt="I think using AI technology could make my peer support work more manageable."
							value={aiMakesWorkManageable}
							onChange={setAiMakesWorkManageable}
						/>

						<textarea
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
							placeholder="(Optional) Please share your thoughts, if you want to improve anything regarding the app..."
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
							disabled={answersMissing || isSubmitting}
							style={{
								padding: '8px 16px',
								borderRadius: '6px',
								background: 'transparent', // Always transparent to match Logout initial state
								color: answersMissing || isSubmitting ? 'var(--muted)' : 'var(--primary)',
								border: answersMissing || isSubmitting ? '2px solid var(--muted)' : '2px solid var(--primary)',
								cursor: answersMissing || isSubmitting ? 'not-allowed' : 'pointer',
								fontSize: '14px',
								fontWeight: '500',
								transition: 'all 0.3s ease',
								marginTop: '16px' // Added margin for spacing
							}}
						>
							{isSubmitting ? 'Submitting...' : 'Submit Feedback'}
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
