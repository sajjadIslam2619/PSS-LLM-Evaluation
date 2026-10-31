import React, { useEffect, useState } from 'react'

const DEMO_VIDEO_URL = 'https://player.vimeo.com/video/1238999653?badge=0&autopause=0&player_id=0&app_id=58479'
const DEMO_TITLE = 'LLM Evaluation in Peer Support System (PSS)'

const VideoFrame: React.FC<{ autoplay?: boolean }> = ({ autoplay = false }) => (
	<div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
		<iframe
			src={autoplay ? `${DEMO_VIDEO_URL}&autoplay=1` : DEMO_VIDEO_URL}
			allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
			referrerPolicy="strict-origin-when-cross-origin"
			title={DEMO_TITLE}
			style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
		/>
	</div>
)

/** Small inline player with a button to watch it in a larger popup. */
export const DemoVideo: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		if (!isOpen) return
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsOpen(false)
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [isOpen])

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '360px' }}>
			<span style={{ color: 'var(--text)', fontWeight: '500' }}>Application demo</span>
			<div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #2a355f', background: '#000' }}>
				{/* Unmounted while the popup is open so only one player has sound. */}
				{isOpen ? <div style={{ paddingTop: '56.25%' }} /> : <VideoFrame />}
			</div>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				style={{
					background: 'transparent',
					border: 'none',
					padding: 0,
					color: 'var(--primary)',
					textDecoration: 'underline',
					cursor: 'pointer',
					fontSize: '15px',
					textAlign: 'left',
				}}
			>
				⤢ Watch in a larger window
			</button>

			{isOpen && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label={DEMO_TITLE}
					onClick={() => setIsOpen(false)}
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0, 0, 0, 0.75)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '16px',
						zIndex: 1000,
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{ width: '100%', maxWidth: 'min(960px, calc((100vh - 96px) * 16 / 9))', position: 'relative' }}
					>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							aria-label="Close demo"
							style={{
								position: 'absolute',
								top: '-40px',
								right: 0,
								width: 'auto',
								padding: '4px 12px',
								fontSize: '16px',
							}}
						>
							✕ Close
						</button>
						<VideoFrame autoplay />
					</div>
				</div>
			)}
		</div>
	)
}
