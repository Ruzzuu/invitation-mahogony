import Countdown from './Countdown'
import FadeIn from './FadeIn'

const AKAD_MAP = 'https://maps.app.goo.gl/ocemaVVZd9t6CDnq6'
const RESEPSI_MAP = 'https://maps.app.goo.gl/Zp7DoRCEpxAF9mpG8'

export default function EventDetails() {
  return (
    <div className="min-h-full bg-mahogany pb-10">
      {/* Top Section: Events with Background Image */}
      <div className="relative w-full bg-cover bg-center pb-8 pt-10" style={{ backgroundImage: 'url(/together.jpeg)' }}>
        <div className="absolute inset-0 bg-mahogany/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-mahogany via-transparent to-mahogany/40" />
        
        <FadeIn className="relative z-10 px-6 text-center text-ivory">
          <p className="text-xs tracking-[0.2em] uppercase text-ivory/70 font-semibold mb-2">THE DAY</p>
          <h2 className="font-serif text-4xl mb-5 tracking-widest">WEDDING<br/><span className="font-script text-5xl -mt-4 block opacity-80">Event</span></h2>

          {/* Akad Nikah */}
          <div className="mb-6">
            <h3 className="font-serif text-2xl tracking-widest mb-3">AKAD NIKAH</h3>
            <p className="text-sm font-medium mb-1">Sabtu, 5 September 2026</p>
            <p className="text-sm font-medium mb-1">Pukul 09:00 WIB</p>
            <p className="text-sm text-ivory/80">Masjid Istiqlal, Jakarta Pusat</p>
            <a
              href={AKAD_MAP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-full bg-ivory text-xs text-mahogany font-medium hover:bg-ivory/90 active:scale-95 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              Buka Google Maps
            </a>
          </div>

          {/* Countdown */}
          <div className="my-5">
            <Countdown />
          </div>

          {/* Resepsi */}
          <div className="mb-4">
            <h3 className="font-serif text-2xl tracking-widest mb-3">RESEPSI</h3>
            <p className="text-sm font-medium mb-1">Sabtu, 5 September 2026</p>
            <p className="text-sm font-medium mb-1">Pukul 09:00 WIB</p>
            <p className="text-sm text-ivory/80">Graha Cempaka, Jakarta</p>
            <a
              href={RESEPSI_MAP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-full bg-ivory text-xs text-mahogany font-medium hover:bg-ivory/90 active:scale-95 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              Buka Google Maps
            </a>
          </div>
        </FadeIn>
      </div>

      {/* Bottom Section: Love Story */}
      <div className="bg-ivory px-6 py-10 text-center text-mahogany rounded-t-3xl -mt-6 relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <FadeIn>
          <p className="text-xs tracking-[0.2em] uppercase text-mahogany/60 font-semibold mb-2">OUR JOURNEY</p>
          <h2 className="font-serif text-3xl tracking-widest mb-6">LOVE STORY</h2>

          <div className="flex flex-col gap-8 max-w-md mx-auto">
            <div>
              <h4 className="font-bold text-sm mb-2">First Meet (2022)</h4>
              <p className="text-xs text-mahogany/70 leading-relaxed">Bulan Oktober 2022 pertama kali bertemu ngopi bareng di coffee shop.</p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2">Relationship (2022)</h4>
              <p className="text-xs text-mahogany/70 leading-relaxed">4 Desember 2022 kami memutuskan untuk mencoba mengenal satu sama lain sebagai sepasang kekasih.</p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2">Engagement (2025)</h4>
              <p className="text-xs text-mahogany/70 leading-relaxed">5 September 2025 kami melangkah ke jenjang yang lebih serius.</p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2">Married (2026)</h4>
              <p className="text-xs text-mahogany/70 leading-relaxed">Dengan izin Allah SWT. dan keluarga, kami memutuskan untuk menikah pada 5 September 2026.</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
