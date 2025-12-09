import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export const InstructionPage: React.FC = () => {
    const navigate = useNavigate()
    //const { username, markInstructionsAsSeen } = useAuth()
    const { markInstructionsAsSeen } = useAuth()

    const handleContinue = () => {
        markInstructionsAsSeen()
        navigate('/home')
    }

    const isMobile = window.innerWidth < 480

    return (
        <div className="container">
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 16 : 24 }}>
                <h1 style={{ fontSize: isMobile ? '24px' : '32px', margin: '0 0 8px 0', color: 'var(--primary)' }}>
                    Welcome to Peer Support System
                </h1>
                <p style={{ color: 'var(--muted)', fontSize: isMobile ? '14px' : '16px', margin: 0 }}>
                    {/*Hello, <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{username}</span>! Here's how to use this application.*/}
                    Hello!! Here's how to use this application.
                </p>
            </div>

            <div className="card">
                <h2 style={{ margin: '0 0 16px 0', fontSize: isMobile ? '18px' : '22px', color: 'var(--text)' }}>
                    How to Use This Application
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' }}>
                    {/* Part 1 Header */}
                    <div style={{ marginBottom: isMobile ? '8px' : '12px' }}>
                        <h3 style={{ fontSize: isMobile ? '18px' : '20px', color: 'var(--primary)', margin: 0 }}>
                            Part 1: Reviewing Posts
                        </h3>
                    </div>

                    {/* Step 1 */}
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                            minWidth: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: isMobile ? '16px' : '18px',
                            flexShrink: 0
                        }}>
                            1
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '16px' : '18px', color: 'var(--text)' }}>
                                Review the Social Media Post
                            </h3>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.6' }}>
                                Read the social media post carefully. The AI will automatically detect and display labels that categorize the post's content.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                            minWidth: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: isMobile ? '16px' : '18px',
                            flexShrink: 0
                        }}>
                            2
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '16px' : '18px', color: 'var(--text)' }}>
                                Verify AI Detected Labels
                            </h3>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.6' }}>
                                Check if the AI-detected labels accurately represent the post. If you disagree, select your own labels from the available options.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                            minWidth: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: isMobile ? '16px' : '18px',
                            flexShrink: 0
                        }}>
                            3
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '16px' : '18px', color: 'var(--text)' }}>
                                Generate AI Response
                            </h3>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.6' }}>
                                Click the "Generate Response with AI" button to create an automated supportive response to the post.
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                            minWidth: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: isMobile ? '16px' : '18px',
                            flexShrink: 0
                        }}>
                            4
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '16px' : '18px', color: 'var(--text)' }}>
                                Evaluate the Response
                            </h3>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.6' }}>
                                Review the AI-generated response and rate it on three categories: <strong>Empathy</strong>, <strong>Relevant</strong>, and <strong>Safe</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Step 5 */}
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                            minWidth: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: isMobile ? '16px' : '18px',
                            flexShrink: 0
                        }}>
                            5
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '16px' : '18px', color: 'var(--text)' }}>
                                Provide Your Own Response (Optional)
                            </h3>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.6' }}>
                                If you're not satisfied with the AI response, you can write your own alternative response in the text area provided.
                            </p>
                        </div>
                    </div>

                    {/* Step 6 */}
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                            minWidth: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: isMobile ? '16px' : '18px',
                            flexShrink: 0
                        }}>
                            6
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '16px' : '18px', color: 'var(--text)' }}>
                                Continue to Next Post
                            </h3>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.6' }}>
                                Click "Next Post" to move to the next social media post. After reviewing all posts, click "Submit All Reviews" to complete the evaluation.
                            </p>
                        </div>
                    </div>

                    <hr style={{ border: '0', borderTop: '1px solid #e1e4e8', margin: '16px 0' }} />

                    {/* Part 2 Header */}
                    <div style={{ marginBottom: isMobile ? '8px' : '12px' }}>
                        <h3 style={{ fontSize: isMobile ? '18px' : '20px', color: 'var(--primary)', margin: 0 }}>
                            Part 2: Curating Your Own Posts
                        </h3>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px' }}>
                            After reviewing the assigned posts, you can curate your own examples.
                        </p>
                    </div>

                    {/* Step 7 */}
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                            minWidth: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: isMobile ? '16px' : '18px',
                            flexShrink: 0
                        }}>
                            1
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '16px' : '18px', color: 'var(--text)' }}>
                                Enter Post Content
                            </h3>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.6' }}>
                                Click "Curate your own post" on the Home page. Enter your own text for a social media post in the provided text area.
                            </p>
                        </div>
                    </div>

                    {/* Step 8 */}
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                            minWidth: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: isMobile ? '16px' : '18px',
                            flexShrink: 0
                        }}>
                            2
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '16px' : '18px', color: 'var(--text)' }}>
                                Classify and Evaluate
                            </h3>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.6' }}>
                                You can use "Classify the Post with AI" to get suggested labels, or select them manually. Then generate a response and evaluate it just like in Part 1.
                            </p>
                        </div>
                    </div>

                    {/* Step 9 */}
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                            minWidth: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: isMobile ? '16px' : '18px',
                            flexShrink: 0
                        }}>
                            3
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '16px' : '18px', color: 'var(--text)' }}>
                                Save or Continue
                            </h3>
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.6' }}>
                                Click "Curate another post" to save and start a fresh entry, or "Save and Exit" to finish your session.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: isMobile ? '20px' : '28px',
                    padding: isMobile ? '12px' : '16px',
                    background: 'rgba(110, 168, 254, 0.1)',
                    border: '1px solid rgba(110, 168, 254, 0.3)',
                    borderRadius: '8px'
                }}>
                    <p style={{
                        margin: 0,
                        color: 'var(--text)',
                        fontSize: isMobile ? '13px' : '14px',
                        lineHeight: '1.6'
                    }}>
                        <strong>💡 Tip:</strong> Take your time to carefully evaluate each post and response. Your feedback helps improve the AI system's ability to provide supportive responses.
                    </p>
                </div>

                <div style={{ marginTop: isMobile ? '20px' : '24px', textAlign: 'center' }}>
                    <button
                        onClick={handleContinue}
                        style={{
                            padding: isMobile ? '12px 24px' : '14px 32px',
                            fontSize: isMobile ? '15px' : '16px',
                            fontWeight: '600',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            minWidth: isMobile ? '200px' : '240px'
                        }}
                    >
                        Continue to Application →
                    </button>
                </div>
            </div>
        </div>
    )
}
