import { useEffect, useState } from 'react'
import { WEDDING_DATE } from '../App'
import ResponsiveBackground from './ResponsiveBackground'

function useCountdown(target) {
  const calc = () => {
    const diff = target - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function Cover({ onOpen }) {
  const time = useCountdown(WEDDING_DATE)
  const [guestName, setGuestName] = useState('Nama Tamu')

  // Grab the guest name from the URL parameter (e.g., ?to=John+Doe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const to = params.get('to')
    if (to) {
      setGuestName(to)
    }
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen overflow-hidden text-center select-none text-ivory">
      {/* Responsive background keeps both people visible on narrow screens */}
      <ResponsiveBackground src="/together.jpeg" priority />
      
      {/* Overlay - Semi-transparent to keep text readable without being full black */}
      <div className="absolute inset-0 bg-mahogany/55 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-mahogany/95 via-transparent to-mahogany/60 z-0" />

      {/* ── TOP: label + names ── */}
      <div className="relative z-10 mt-16 animate-fade-up px-6 w-full">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-ivory/90 mb-3 drop-shadow-md">
          The Wedding Of
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-ivory leading-none drop-shadow-lg uppercase">
          Alfa &amp; Rizaldy
        </h1>
      </div>

      {/* ── MIDDLE: Guest Info ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center animate-fade-up anim-delay-100 mt-4">
        <div className="text-center">
          <p className="text-sm md:text-base text-ivory/90 mb-1 drop-shadow-md">Kepada Yth;</p>
          <p className="text-sm md:text-base text-ivory/90 mb-3 drop-shadow-md">Bapak/Ibu/Saudara/i</p>
          <p className="text-2xl md:text-3xl font-bold text-ivory drop-shadow-lg capitalize">
            {guestName}
          </p>
        </div>
      </div>

      {/* ── BOTTOM: date → countdown → button ── */}
      <div className="relative z-10 w-full flex flex-col items-center gap-5 pb-10 px-4 animate-fade-up anim-delay-200">
        
        {/* Date */}
        <div className="flex items-center gap-3 w-full justify-center drop-shadow-md">
          <div className="flex-1 max-w-[48px] h-px bg-ivory/40" />
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-ivory/90">
            Sabtu, 5 September 2026
          </p>
          <div className="flex-1 max-w-[48px] h-px bg-ivory/40" />
        </div>

        {/* Countdown */}
        <div className="flex gap-3 drop-shadow-lg">
          {[
            { v: time.days, l: 'Hari' },
            { v: time.hours, l: 'Jam' },
            { v: time.minutes, l: 'Menit' },
            { v: time.seconds, l: 'Detik' },
          ].map(({ v, l }) => (
            <div key={l} className="bg-ivory/10 backdrop-blur-md rounded-xl px-3 py-2.5 text-center min-w-[64px] border border-ivory/20">
              <p className="text-2xl font-bold text-ivory leading-none tabular-nums">
                {String(v).padStart(2, '0')}
              </p>
              <p className="text-[10px] text-ivory/70 font-medium mt-1 uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onOpen}
          className="mt-2 px-12 py-4 rounded-full bg-ivory text-mahogany font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(239,239,240,0.3)] animate-pulse-ring active:scale-95 transition-all hover:bg-ivory/90"
        >
          Open Invitation
        </button>
      </div>
    </div>
  )
}
