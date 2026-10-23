import { useEffect, useRef } from 'react'
import './RoastStatement.css'

export default function RoastStatement() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches || !('IntersectionObserver' in window)) return

    section.dataset.reveal = 'pending'
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      section.dataset.reveal = 'visible'
      observer.disconnect()
    }, { threshold: 0.2 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="roast-statement" ref={sectionRef} aria-labelledby="roast-title">
      <div className="roast-composition">
        <p className="roast-eyebrow roast-entrance">THE ROAST</p>
        <h2 id="roast-title" className="roast-title roast-entrance">HEAT,<br />WITH PURPOSE.</h2>
        <div className="roast-copy roast-entrance">
          <p>We roast in small batches to preserve clarity, sweetness and origin.</p>
          <p className="roast-secondary">Nothing rushed.<br />Nothing hidden.</p>
        </div>
        <p className="roast-technical roast-entrance">SMALL BATCH / 198–205°C / 11–13 MIN</p>
      </div>
      <div className="roast-video">
        <video src="/video/coffee-roast-process.mp4" autoPlay muted loop playsInline preload="auto" aria-label="Coffee roasting process: beans, smoke and amber highlights" />
      </div>
    </section>
  )
}
