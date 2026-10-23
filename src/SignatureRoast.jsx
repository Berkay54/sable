import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './SignatureRoast.css'

gsap.registerPlugin(ScrollTrigger)

const coffees = [
  { name: 'SABLE HOUSE', district: '', origin: 'Brazil / Colombia', notes: ['Dark Chocolate', 'Caramel', 'Roasted Hazelnut'], roast: 'MEDIUM-DARK', price: 420 },
  { name: 'ETHIOPIA', district: 'YIRGACHEFFE', origin: 'Ethiopia', notes: ['Jasmine', 'Bergamot', 'Peach'], roast: 'LIGHT', price: 480 },
  { name: 'COLOMBIA', district: 'HUILA', origin: 'Colombia', notes: ['Red Apple', 'Caramel', 'Cacao'], roast: 'MEDIUM', price: 450 },
  { name: 'GUATEMALA', district: 'ANTIGUA', origin: 'Guatemala', notes: ['Cocoa', 'Brown Sugar', 'Orange Peel'], roast: 'MEDIUM-DARK', price: 460 },
]

export default function SignatureRoast() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const video = section.querySelector('video')
    const cards = [...section.querySelectorAll('.signature-menu-card')]
    const media = gsap.matchMedia()
    media.add({
      desktop: '(min-width: 1024px)',
      mobile: '(max-width: 1023px)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      const { desktop, reduce } = context.conditions
      video.pause()
      video.loop = false
      const source = desktop && !reduce ? '/video/coffee-signature-scrub.mp4' : '/video/coffee-signature.mp4'
      if (video.getAttribute('src') !== source) {
        video.src = source
        video.load()
      }
      if (reduce) {
        video.currentTime = 0
        return
      }

      let playbackObserver
      let frame = 0
      let targetTime = 0
      let lastFrame = performance.now()

      // Card setup does not depend on video metadata or decoding.
      gsap.set(cards, { autoAlpha: 0, yPercent: 0, y: 80, scale: 0.985, pointerEvents: 'none' })
      gsap.set(cards[0], { autoAlpha: 1, y: 0, scale: 1, pointerEvents: 'auto' })
      const timeline = gsap.timeline({ paused: true })
      const hold = 1
      // 62.5% hold / 37.5% transition within each changing chapter.
      const transition = 0.6
      const clock = { value: 0 }
      for (let index = 0; index < cards.length; index++) {
        timeline.addLabel('card-' + (index + 1))
        timeline.to(clock, { value: index + 1, duration: hold, ease: 'none' })
        if (index === cards.length - 1) break
        const start = timeline.duration()
        timeline.to(cards[index], {
          y: -70, scale: 0.985, duration: transition, ease: 'power2.inOut',
        }, start)
        timeline.to(cards[index], {
          autoAlpha: 0, duration: transition * 0.85, ease: 'power2.inOut',
        }, start)
        timeline.fromTo(cards[index + 1], {
          y: 80, scale: 0.985,
        }, {
          y: 0, scale: 1, duration: transition, ease: 'power2.inOut',
          immediateRender: false,
        }, start)
        timeline.fromTo(cards[index + 1], { autoAlpha: 0 }, {
          autoAlpha: 1, duration: transition * 0.85, ease: 'power2.inOut',
          immediateRender: false,
        }, start + transition * 0.15)
        timeline.set(cards[index], { pointerEvents: 'none' }, start + transition / 2)
        timeline.set(cards[index + 1], { pointerEvents: 'auto' }, start + transition / 2)
      }

      const updateTarget = (self) => {
        targetTime = Number.isFinite(video.duration) ? self.progress * video.duration : 0
      }
      const trigger = ScrollTrigger.create({
        id: 'signature-menu-master',
        trigger: section,
        animation: timeline,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: updateTarget,
        onRefresh: updateTarget,
      })

      const metadataReady = () => {
        video.pause()
        updateTarget(trigger)
      }

      // One continuous RAF loop eases the paused media clock independently.
      const smoothSeek = (now) => {
        const elapsed = now - lastFrame
        lastFrame = now
        if (video.readyState >= 2 && Number.isFinite(video.duration) && !video.seeking) {
          const delta = targetTime - video.currentTime
          // 0.08 at 60 Hz; time-corrected when rendering is slower.
          const smoothing = 1 - Math.pow(1 - 0.08, Math.min(elapsed, 250) / (1000 / 60))
          if (Math.abs(delta) > 0.015) video.currentTime += delta * smoothing
          // Settle precisely at the ends after easing into the final frame.
          else if (Math.abs(delta) > 0.001) video.currentTime = targetTime
        }
        frame = requestAnimationFrame(smoothSeek)
      }

      if (desktop) {
        video.addEventListener('loadedmetadata', metadataReady)
        if (video.readyState >= 1) metadataReady()
        frame = requestAnimationFrame(smoothSeek)
      } else {
        video.loop = true
        playbackObserver = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) video.play().catch(() => {})
          else video.pause()
        }, { threshold: 0.15 })
        playbackObserver.observe(video)
      }
      return () => {
        video.removeEventListener('loadedmetadata', metadataReady)
        cancelAnimationFrame(frame)
        playbackObserver?.disconnect()
        trigger.kill()
        timeline.revert()
        video.pause()
      }
    })
    return () => media.revert()
  }, [])

  return (
    <section className="signature-roast" ref={sectionRef} aria-labelledby="signature-title">
      <div className="signature-stage">
        <div className="signature-content">
          <h2 className="signature-eyebrow" id="signature-title">OUR ROASTS</h2>
          <p className="signature-intro">Four expressions.<br />One philosophy.</p>
          <div className="signature-menu">
            {coffees.map((coffee, index) => (
              <article className="signature-menu-card" key={coffee.name} aria-labelledby={'coffee-' + index}>
                <p className="signature-index">{String(index + 1).padStart(2, '0')}</p>
                <h3 id={'coffee-' + index}>{coffee.name}</h3>
                <p className="signature-district">{coffee.district || '\u00a0'}</p>
                <p className="signature-origin">{coffee.origin}</p>
                <ul className="signature-notes" aria-label="Tasting notes">
                  {coffee.notes.map(note => <li key={note}>{note}</li>)}
                </ul>
                <p className="signature-roast-level">{coffee.roast}</p>
                <div className="signature-card-footer">
                  <span>250 G</span>
                  <span className="signature-price">{'\u20ba'}{coffee.price}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="signature-film">
          <video src="/video/coffee-signature.mp4" muted playsInline preload="auto" aria-label="SABLE signature coffee film" />
        </div>
      </div>
    </section>
  )
}

