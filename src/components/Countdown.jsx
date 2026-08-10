import { useEffect, useState } from 'react'
import { WEDDING_DATE } from '../App'

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

export default function Countdown() {
  const time = useCountdown(WEDDING_DATE)
  const units = [
    { v: time.days, l: 'Hari' },
    { v: time.hours, l: 'Jam' },
    { v: time.minutes, l: 'Menit' },
    { v: time.seconds, l: 'Detik' },
  ]

  return (
    <div className="text-center py-6 px-4">
      <div className="flex justify-center gap-3">
        {units.map(({ v, l }) => (
          <div key={l} className="bg-ivory/10 backdrop-blur-sm border border-ivory/20 rounded-xl px-4 py-3 text-center min-w-[60px] shadow-md">
            <p className="text-2xl font-bold text-ivory leading-none tabular-nums">
              {String(v).padStart(2, '0')}
            </p>
            <p className="text-[10px] text-ivory/70 font-medium mt-1 uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
