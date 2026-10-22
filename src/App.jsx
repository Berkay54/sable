import { useEffect, useRef, useState } from 'react'
import './App.css'
import RoastStatement from './RoastStatement'

const navigation = [['ROASTS', '/roasts'], ['PROCESS', '/process'], ['JOURNAL', '/journal'], ['SHOP', '/shop']]

export default function App() {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      if (preference.matches) videoRef.current?.pause()
      else videoRef.current?.play().catch(() => {})
    }
    sync()
    preference.addEventListener('change', sync)
    return () => preference.removeEventListener('change', sync)
  }, [])
  function toggleFilm() {
    const video = videoRef.current
    if (video.paused) video.play().catch(() => setFailed(true))
    else video.pause()
  }
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-film" aria-hidden="true">
            <video ref={videoRef} autoPlay={!window.matchMedia('(prefers-reduced-motion: reduce)').matches}
              muted loop playsInline preload="auto" poster="/video/coffee-poster.jpg"
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
              onError={() => setFailed(true)} style={failed ? { visibility: 'hidden' } : undefined}>
              <source src="/video/coffee-hero.mp4" type="video/mp4" onError={() => setFailed(true)} />
            </video>
          </div>
          <header className="site-header">
            <a className="wordmark" href="/" aria-label="Sable home">SABLE</a>
            <nav className="main-nav" aria-label="Main navigation">
              {navigation.map(([label, href]) => <a className="nav-link" href={href} key={label}>{label}</a>)}
            </nav>
            <a className="order-link arrow-link" href="/shop">ORDER <span aria-hidden="true">→</span></a>
          </header>
          <div className="hero-copy">
            <p className="eyebrow reveal">SMALL BATCH / SLOW ROAST</p>
            <h1 id="hero-title" className="reveal">COFFEE,<br />TAKEN SERIOUSLY.</h1>
            <p className="supporting-copy reveal">Roasted in small batches.<br />Built around origin, heat and time.</p>
            <a className="hero-cta arrow-link reveal" href="/roasts">VIEW THE ROASTS <span aria-hidden="true">→</span></a>
          </div>
          {!failed && <button className="film-toggle" type="button" onClick={toggleFilm} aria-label={playing ? 'Pause background film' : 'Play background film'}>
            <span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>
            <span>{playing ? 'PAUSE FILM' : 'PLAY FILM'}</span>
          </button>}
        </section>
        <RoastStatement />
      </main>
    </>
  )
}
