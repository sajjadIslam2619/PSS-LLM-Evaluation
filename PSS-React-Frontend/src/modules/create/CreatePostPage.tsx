import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { api } from '../../shared/api'
import labels from '../home/labels.json'

export const CreatePostPage: React.FC = () => {
    const navigate = useNavigate()
    const { username, logout } = useAuth()

    const [post, setPost] = useState('')
    const [response, setResponse] = useState('')
    const [selectedLabels, setSelectedLabels] = useState<{ name: string; percentage: number }[]>([])
    const [labelsLoading, setLabelsLoading] = useState(false)
    const [labelsError, setLabelsError] = useState<string | null>(null)

    const [empathy, setEmpathy] = useState<string>('')
    const [relevant, setRelevant] = useState<string>('')
    const [safe, setSafe] = useState<string>('')
    const [customLabels, setCustomLabels] = useState<string[]>([])
    const [userCustomResponse, setUserCustomResponse] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [responseGenerating, setResponseGenerating] = useState(false)
    const [responseError, setResponseError] = useState<string | null>(null)

    const MIN_WORDS_FOR_LABELS = 30
    const wordCount = post.trim().split(/\s+/).filter(Boolean).length

    // Fetch AI-detected labels when post changes (debounced); skip if post has fewer than 30 words
    useEffect(() => {
        if (!post.trim()) {
            setSelectedLabels([])
            setLabelsError(null)
            return
        }
        if (wordCount < MIN_WORDS_FOR_LABELS) {
            setSelectedLabels([])
            setLabelsError('The post is too small to detect labels.')
            return
        }
        const timer = setTimeout(() => {
            setLabelsLoading(true)
            setLabelsError(null)
            api.getDetectedLabels(post.trim())
                .then((res) => {
                    if (res.error) {
                        setLabelsError(res.error)
                        setSelectedLabels([])
                    } else {
                        setLabelsError(null)
                        setSelectedLabels(res.labels || [])
                    }
                })
                .catch((e) => {
                    console.error('Failed to fetch detected labels:', e)
                    setLabelsError('Something went wrong, no mental status detected by AI')
                    setSelectedLabels([])
                })
                .finally(() => {
                    setLabelsLoading(false)
                })
        }, 500)
        return () => clearTimeout(timer)
    }, [post, wordCount])

    const generateResponse = async () => {
        if (!post.trim()) {
            alert('Please enter a post content first.')
            return
        }
        setResponseGenerating(true)
        setResponseError(null)
        try {
            const data = await api.getGeneratedResponse(post.trim())
            if (data.error) {
                setResponseError(data.error)
                setResponse('')
            } else {
                setResponse(data.response || '')
                setResponseError(null)
            }
        } catch (e) {
            console.error('Failed to generate response:', e)
            setResponseError('Something went wrong calling the AI API.')
        } finally {
            setResponseGenerating(false)
        }
    }

    const handleLabelSelection = (label: string) => {
        if (customLabels.includes(label)) {
            setCustomLabels(customLabels.filter((l) => l !== label))
        } else {
            setCustomLabels([...customLabels, label])
        }
    }

    const saveCurrentToBackend = async (): Promise<boolean> => {
        if (!username) return false
        if (!post.trim()) return true
        try {
            await api.createOwnPostResponse({
                user_identifier: username,
                post_content: post.trim(),
                ai_generated_response: response.trim() || undefined,
                empathy: empathy || undefined,
                relevant: relevant || undefined,
                safe: safe || undefined,
                modified_response: userCustomResponse.trim() || undefined,
                ai_mental_status: selectedLabels.map((l) => l.name).join(', ') || undefined,
                mental_status: customLabels.length ? customLabels.join(', ') : undefined,
            })
            return true
        } catch (e) {
            console.error('Failed to save own post response:', e)
            alert('Failed to save. Please try again.')
            return false
        }
    }

    const handleSaveAndExit = async () => {
        setIsSaving(true)
        try {
            const ok = await saveCurrentToBackend()
            if (ok) navigate('/thank-you')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCreateAnotherPost = async () => {
        const ok = await saveCurrentToBackend()
        if (!ok) return
        setPost('')
        setResponse('')
        setUserCustomResponse('')
        setSelectedLabels([])
        setEmpathy('')
        setRelevant('')
        setSafe('')
        setCustomLabels([])
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
                                minHeight: isMobile ? '36px' : 'auto',
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    const renderDetectedLabels = () => {
        if (labelsLoading) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <span
                        style={{
                            width: 20,
                            height: 20,
                            border: '2px solid var(--muted)',
                            borderTopColor: 'var(--primary)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }}
                    />
                    <span style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '500' }}>Detecting mental status, please wait...</span>
                </div>
            )
        }
        if (labelsError) return <span style={{ color: '#e57373', fontSize: '14px' }}>{labelsError}</span>
        if (selectedLabels.length === 0) return null
        return (
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                {selectedLabels.map((label, index) => (
                    <span
                        key={index}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            fontSize: window.innerWidth < 768 ? '14px' : '15px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {label.name} {label.percentage}%
                    </span>
                ))}
            </div>
        )
    }

    return (
        <div className="container">
            <div
                style={{
                    display: 'flex',
                    flexDirection: window.innerWidth < 480 ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: window.innerWidth < 480 ? 'flex-start' : 'center',
                    gap: window.innerWidth < 480 ? '8px' : '0',
                    marginBottom: window.innerWidth < 480 ? 8 : 16,
                }}
            >
                <h1 style={{ margin: 0, fontSize: window.innerWidth < 480 ? '22px' : '30px' }}>Evaluate Your Own Post</h1>
                <button
                    onClick={logout}
                    style={{
                        padding: window.innerWidth < 480 ? '8px 12px' : '6px 12px',
                        fontSize: window.innerWidth < 480 ? '16px' : '17px',
                        alignSelf: window.innerWidth < 480 ? 'flex-start' : 'center',
                    }}
                >
                    Logout
                </button>
            </div>

            <div className="card">
                <div
                    style={{
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        gap: window.innerWidth < 768 ? '16px' : '24px',
                        marginBottom: '16px',
                    }}
                >
                    <div style={{ flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Create Post Section */}
                        <div>
                            <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                                <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }} title="Enter your own social media post content here.">1️⃣</span> Please enter your own post
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
                                    fontSize: '17px',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {window.innerWidth < 768 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                                    <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }} title="AI automatically detects labels for your post. Review them and select additional labels if needed.">2️⃣</span> Please check AI detected mental state labels of the post
                                </span>
                                <div>
                                    <span style={{ color: 'var(--muted)', fontSize: '16px', fontWeight: '500' }}>
                                        AI Detected Labels:
                                        <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '16px', opacity: 1.0 }} title="These are labels from the API with confidence percentages.">ℹ️</span>
                                    </span>
                                    {renderDetectedLabels()}
                                </div>
                                <div>
                                    <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                                        <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }} title="Are the labels accurate? If not, please select labels based on your thoughts.">3️⃣</span> Are the labels accurate? If not, please select labels based on your thoughts:
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
                                                    fontSize: '14px',
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                                <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }} title="Click the button to generate a response of the post with AI.">4️⃣</span> Please click the button to generate a response of the post with AI.
                            </span>
                            <button onClick={generateResponse} disabled={responseGenerating} style={{ width: 'auto', maxWidth: '250px', padding: '8px 16px', fontSize: '16px' }}>{responseGenerating ? 'Generating…' : 'Generate Response with AI'}</button>
                            {responseGenerating && (
                                <p style={{ marginTop: '8px', color: 'var(--primary)', fontSize: '15px' }}>Generating response, please wait…</p>
                            )}
                            {responseError && (
                                <p style={{ marginTop: '8px', color: '#e74c3c', fontSize: '15px' }}>{responseError}</p>
                            )}
                        </div>

                        <div>
                            <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                                <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }} title="This is the response automatically generated by AI.">5️⃣</span> Please read the AI generated response carefully
                            </span>
                            <div
                                style={{
                                    minHeight: '100px',
                                    maxHeight: '200px',
                                    overflow: 'auto',
                                    padding: '12px',
                                    border: '1px solid #2a355f',
                                    borderRadius: '8px',
                                    background: 'rgba(42, 53, 95, 0.2)',
                                    color: 'var(--text)',
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '15px',
                                }}
                            >
                                {response || 'Generated response will appear here...'}
                            </div>
                        </div>
                    </div>

                    {window.innerWidth >= 768 && (
                        <div style={{ flex: '0 0 auto', width: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                                <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }} title="AI automatically detects labels for your post. Review them and select additional labels if needed.">2️⃣</span> Please check AI detected mental state labels of the post
                            </span>
                            <div>
                                <span style={{ color: 'var(--muted)', fontSize: '17px', fontWeight: '500' }}>
                                    AI Detected Labels:
                                    <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '14px', opacity: 1.0 }} title="These are labels from the API with confidence percentages.">ℹ️</span>
                                </span>
                                {renderDetectedLabels()}
                            </div>
                            <div>
                                <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                                    <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }} title="Are the labels accurate? If not, please select labels based on your thoughts.">3️⃣</span> Are the labels accurate? If not, please select labels based on your thoughts:
                                </span>
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
                                                fontSize: '13px',
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
                </div>

                {response && (
                    <div style={{ marginTop: 16 }}>
                        <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                            <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }} title="Evaluate the AI-generated response.">6️⃣</span> Evaluate the AI-generated response on following categories:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <br />
                            <EvaluationScale label="Is the Response Empathic?" value={empathy} onChange={setEmpathy} />
                            <br />
                            <EvaluationScale label="Is the Response Relevant to the Post?" value={relevant} onChange={setRelevant} />
                            <br />
                            <EvaluationScale label="Is the Response Safe?" value={safe} onChange={setSafe} />
                        </div>
                    </div>
                )}

                {response && (
                    <div style={{ marginTop: 16 }}>
                        <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                            <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '20px', opacity: 1.0 }} title="If the AI response is inadequate, you can provide your own alternative response here.">7️⃣</span> If you're not satisfied with the AI generated response, please write your own response:
                        </span>
                        <textarea
                            rows={5}
                            value={userCustomResponse}
                            onChange={(e) => setUserCustomResponse(e.target.value)}
                            placeholder="Enter your custom response here..."
                            style={{ width: '100%', minHeight: '100px', padding: '10px', resize: 'vertical' }}
                        />
                    </div>
                )}

                <div style={{ marginTop: 24 }}>
                    <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: '500' }}>
                        <span style={{ marginLeft: '6px', cursor: 'help', fontSize: '18px', opacity: 1.0 }} title="Click 'Create another post' to save and start a fresh entry, or 'Save and Exit' to finish.">8️⃣</span> Click "Create another post" to save and start a fresh entry, or "Save and Exit" to finish your session.
                    </span>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'left' }}>
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
                                fontSize: '18px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {isSaving ? 'Saving...' : 'Save and Exit'}
                        </button>
                        <button
                            onClick={handleCreateAnotherPost}
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
                            }}
                        >
                            Create another post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
