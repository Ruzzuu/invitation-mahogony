import { useRef, useState, useEffect } from 'react'
import Cover from './components/Cover'
import NavWidget from './components/NavWidget'
import MusicButton from './components/MusicButton'
import Home from './components/Home'
import CoupleProfile from './components/CoupleProfile'
import EventDetails from './components/EventDetails'
import GalleryRSVP from './components/GalleryRSVP'
import Closing from './components/Closing'

export const WEDDING_DATE = new Date('2026-10-24T08:00:00')

const SECTIONS = ['home', 'couple', 'events', 'gallery', 'closing']

export default function App() {
  const [opened, setOpened] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef(null)
  const mainRef = useRef(null)

  useEffect(() => {
    if (!opened) return
    const root = mainRef.current
    const els = SECTIONS.map(id => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { root, threshold: 0.35 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [opened])

  function scrollToSection(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  function handleOpen() {
    setOpened(true)
    if (audioRef.current) {
      audioRef.current.volume = 0.5
      audioRef.current.play().catch(() => {})
      setMusicPlaying(true)
    }
  }

  function toggleMusic() {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.pause()
      setMusicPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setMusicPlaying(true)
    }
  }

  function share() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: 'Undangan Pernikahan', url })
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Link disalin!'))
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/Nadhif Basalamah kota ini tak sama tanpamu.mp3" loop onError={(e) => e.target.removeAttribute('src')} />

      {!opened ? (
        <Cover onOpen={handleOpen} />
      ) : (
        <div className="relative flex flex-col h-screen overflow-hidden bg-dark text-ivory/90">
          <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar relative z-10">
            <section id="home"><Home onTabChange={scrollToSection} onShare={share} /></section>
            <section id="couple"><CoupleProfile /></section>
            <section id="events"><EventDetails /></section>
            <section id="gallery"><GalleryRSVP /></section>
            <section id="closing"><Closing /></section>
          </main>
          <MusicButton playing={musicPlaying} onToggle={toggleMusic} />
          <NavWidget active={activeSection} onChange={scrollToSection} />
        </div>
      )}
    </>
  )
}
