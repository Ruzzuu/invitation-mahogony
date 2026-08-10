import Countdown from './Countdown'
import FadeIn from './FadeIn'

const CAL_DATE = '20261024T080000'
const CAL_END = '20261024T140000'
const CAL_LINK = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+Siti+%26+Rizaldy&dates=/&details=Kami+mengundang+kehadiran+Anda&location=Jakarta"

export default function Home({ onTabChange, onShare }) {
  return (
    <div className="min-h-full bg-mahogany pb-6">
      {/* Header hero */}
      <FadeIn className="relative w-full bg-cover bg-center" style={{ backgroundImage: 'url(/together.jpeg)' }}>
        <div className="absolute inset-0 bg-mahogany/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-mahogany via-transparent to-mahogany/40" />
        <div className="relative z-10 flex flex-col items-center text-ivory pt-8 pb-6">
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2 drop-shadow-md">
            The Wedding Of
          </p>
          <h1 className="font-serif text-5xl drop-shadow-lg italic">
            Siti &amp;
          </h1>
          <h1 className="font-serif text-5xl drop-shadow-lg italic ml-12 mt-1">
            Rizaldy
          </h1>
        </div>
      </FadeIn>

      {/* Content Card */}
      <FadeIn className="relative mx-4 bg-ivory rounded-3xl overflow-hidden shadow-2xl z-10">
        {/* Quranic verse */}
        <div className="p-8 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-mahogany/60 font-semibold mb-4">THE INVITATION</p>
          <p className="text-xs text-mahogany/80 leading-relaxed mb-4">
            "And one of His signs is that He created mates for you from yourselves that you may find rest in them, and He put between you love and compassion; most surely there are signs in this for a people who reflect."
          </p>
          <p className="text-[10px] text-mahogany/60 italic">
            (Q.S. Ar-Rum : 21)
          </p>
        </div>

        {/* Second Photo */}
        <div 
          className="w-full aspect-[4/3] bg-cover bg-[center_top]" 
          style={{ backgroundImage: 'url(/together.jpeg)' }} 
        />
      </FadeIn>

      {/* Event Details & Actions */}
      <FadeIn className="mt-5 px-6 text-center text-ivory">
        <p className="text-sm font-medium tracking-wide">Sabtu, 24 Oktober 2026</p>
        <p className="text-xs text-ivory/70 mt-1 mb-4">Jakarta, Indonesia</p>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-ivory/10 border border-ivory/20 text-ivory font-semibold text-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-base">share</span>
            Bagikan
          </button>
          
          <a
            href={CAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-ivory text-mahogany font-bold text-sm active:scale-95 transition-transform shadow-lg"
          >
            <span className="material-symbols-outlined text-base">calendar_add_on</span>
            Simpan di Kalender
          </a>
        </div>
      </FadeIn>
    </div>
  )
}
