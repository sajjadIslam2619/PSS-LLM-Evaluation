import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import labels from '../home/labels.json'
import comments from '../home/comments.json'

export const CuratePostPage: React.FC = () => {
    const navigate = useNavigate()
    const { logout } = useAuth()

    // State
    const [post, setPost] = useState('')
    const [response, setResponse] = useState('')
    const [selectedLabels, setSelectedLabels] = useState<{ name: string, percentage: number }[]>([])

    // Evaluation state
    const [empathy, setEmpathy] = useState<string>('')
    const [relevant, setRelevant] = useState<string>('')
    const [safe, setSafe] = useState<string>('')

    const [isSatisfiedWithLabels, setIsSatisfiedWithLabels] = useState<boolean | null>(null)
    const [customLabels, setCustomLabels] = useState<string[]>([])
    const [userCustomResponse, setUserCustomResponse] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const classifyPost = () => {
        if (!post.trim()) {
            alert('Please enter a post content first.')
            return
        }
        // Mock classification: Select 2 random labels
        const shuffled = [...labels].sort(() => 0.5 - Math.random())
        const randomLabels = shuffled.slice(0, 2).map(label => ({
            name: label,
            percentage: Math.floor(Math.random() * 50) + 20
        }))
        setSelectedLabels(randomLabels)
    }

    const generateResponse = () => {
        if (!post.trim()) {
            alert('Please enter a post content first.')
            return
        }
        // Mock response generation
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

    const validateCurrentPost = () => {
        const warnings = []

        if (!post.trim()) {
            warnings.push('Please enter some content for the post')
        }

        // if (selectedLabels.length === 0 && customLabels.length === 0) {
        //     warnings.push('Please classify the post with AI or select custom labels')
        // }

        if (isSatisfiedWithLabels === false && customLabels.length === 0) {
            warnings.push('Please select labels since you are not satisfied with detected labels')
        }

        if (!response.trim() && !userCustomResponse.trim()) {
            warnings.push('Please generate an AI response or enter your own')
        }

        return warnings
    }

    const handleSaveAndExit = () => {
        const warnings = validateCurrentPost()
        if (warnings.length > 0) {
            alert('Please complete the following:\n• ' + warnings.join('\n• '))
            return
        }

        setIsSaving(true)
        // Simulate API save
        setTimeout(() => {
            navigate('/thank-you')
        }, 1000)
    }

    const handleCurateFunction = () => {
        const warnings = validateCurrentPost()
        if (warnings.length > 0) {
            alert('Please complete the following:\n• ' + warnings.join('\n• '))
            return
        }

        // Save current (mock) and reset
        // Save current (mock) and reset
        // if (confirm('Entry saved! Do you want to create another post?')) {
        // Reset all fields
        setPost('')
        setResponse('')
        setUserCustomResponse('')
        setSelectedLabels([])
        setEmpathy('')
        setRelevant('')
        setSafe('')
        setIsSatisfiedWithLabels(null)
        setCustomLabels([])
        // }
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
                <h1 style={{ margin: 0, fontSize: window.innerWidth < 480 ? '20px' : '28px' }}>Curate Your Own Post</h1>
                <button onClick={logout} style={{
                    padding: window.innerWidth < 480 ? '8px 12px' : '6px 12px',
                    fontSize: window.innerWidth < 480 ? '14px' : '15px',
                    alignSelf: window.innerWidth < 480 ? 'flex-start' : 'center'
                }}>Logout</button>
            </div>

            <div className="card">

                {/* Main layout */}
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                    gap: window.innerWidth < 768 ? '16px' : '24px',
                    marginBottom: '16px'
                }}>
                    {/* Left panel */}
                    <div style={{ flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Curate Post Section */}
                        <div>
                            <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                                Curate Your Own Post
                                <span
                                    style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 1.0 }}
                                    title="Enter your own social media post content here."
                                >ℹ️</span>
                            </span>
                            <textarea
                                rows={6}
                                value={post}
                                onChange={(e) => setPost(e.target.value)}
                                placeholder="Type a post content here..."
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    padding: '12px',
                                    border: '1px solid #2a355f',
                                    borderRadius: '8px',
                                    background: 'rgba(42, 53, 95, 0.2)',
                                    color: 'var(--text)',
                                    resize: 'vertical',
                                    fontSize: '15px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Labels section for mobile */}
                        {window.innerWidth < 768 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    onClick={classifyPost}
                                    style={{ width: '100%', maxWidth: '200px', marginBottom: '8px' }}
                                >
                                    Classify the Post with AI
                                </button>

                                {selectedLabels.length > 0 && (
                                    <div>
                                        <span style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: '500' }}>
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
                                                    fontSize: '12px',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {label.name} {label.percentage}%
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <span style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                                        Select labels manualy:
                                    </span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {labels.map((label) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => handleLabelSelection(label)}
                                                style={{
                                                    padding: '3px 6px',
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
                                minHeight: '100px',
                                maxHeight: '200px',
                                overflow: 'auto',
                                padding: '12px',
                                border: '1px solid #2a355f',
                                borderRadius: '8px',
                                background: 'rgba(42, 53, 95, 0.2)',
                                color: 'var(--text)',
                                whiteSpace: 'pre-wrap',
                                fontSize: '15px'
                            }}>
                                {response || 'Generated response will appear here...'}
                            </div>
                        </div>
                    </div>

                    {/* Right panel: Labels - Desktop */}
                    {window.innerWidth >= 768 && (
                        <div style={{
                            flex: '0 0 auto',
                            width: '280px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <button
                                onClick={classifyPost}
                                style={{ width: '100%', marginBottom: '8px' }}
                            >
                                Classify the Post with AI
                            </button>

                            {selectedLabels.length > 0 && (
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
                            )}

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
                        </div>
                    )}
                </div>

                {/* Evaluation Scales */}
                {response && (
                    <div style={{ marginTop: 16 }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text)' }}>
                            Please evaluate the AI-generated response:
                            <span
                                style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 1.0 }}
                                title="Evaluate the AI-generated response on three dimensions: Empathy (shows understanding), Relevant (addresses the post), and Safe (appropriate and non-harmful)."
                            >ℹ️</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <EvaluationScale label="Empathy" value={empathy} onChange={setEmpathy} />
                            <EvaluationScale label="Relevant" value={relevant} onChange={setRelevant} />
                            <EvaluationScale label="Safe" value={safe} onChange={setSafe} />
                        </div>
                    </div>
                )}

                {/* User Custom Response */}
                {response && (
                    <div style={{ marginTop: 16 }}>
                        <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                            If you are not satisfied with the AI generated response, please enter your own response:
                            <span
                                style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 1.0 }}
                                title="If the AI response is inadequate, you can provide your own alternative response here."
                            >ℹ️</span>
                        </span>
                        <textarea
                            rows={5}
                            value={userCustomResponse}
                            onChange={(e) => setUserCustomResponse(e.target.value)}
                            placeholder="Enter your custom response here..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: "10px",
                                resize: 'vertical'
                            }}
                        />
                    </div>
                )}

                {/* Footer Buttons */}
                <div style={{ marginTop: 24, display: 'flex', gap: '16px', justifyContent: 'left' }}>
                    <button
                        onClick={handleSaveAndExit}
                        disabled={isSaving}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '2px solid var(--primary)',
                            background: isSaving ? 'var(--primary)' : 'transparent',
                            color: isSaving ? 'white' : 'var(--primary)',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Save and Exit'}
                    </button>
                    <button
                        onClick={handleCurateFunction}
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
                        Curate another post
                    </button>
                </div>
            </div>
        </div>
    )
}
