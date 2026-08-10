import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import FadeIn from './FadeIn'

const PHOTOS = [
  { url: '/together.jpeg', tall: true },
  { url: '/bride.png', tall: false },
  { url: '/groom.png', tall: false },
  { url: '/together.jpeg', tall: true },
  { url: '/bride.png', tall: false },
  { url: '/groom.png', tall: false },
]

const COLORS = ['bg-ivory/15', 'bg-ivory/20', 'bg-ivory/25']

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

const SAMPLE_WISHES = [
  { id: 's1', name: 'Siti Rahayu', message: 'Semoga pernikahan kalian menjadi berkah dan kebahagiaan yang abadi. Selamat menempuh hidup baru! 💕', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 's2', name: 'Ahmad Fauzi', message: 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fi khair. Congrats Bima & Adinda!', created_at: new Date(Date.now() - 7200000).toISOString() },
]

export default function GalleryRSVP() {
  const [wishes, setWishes] = useState(SAMPLE_WISHES)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const [rsvpName, setRsvpName] = useState('')
  const [hadir, setHadir] = useState(true)
  const [jumlah, setJumlah] = useState(1)
  const [rsvpSent, setRsvpSent] = useState(false)
  const [rsvpSending, setRsvpSending] = useState(false)
  const [rsvpError, setRsvpError] = useState('')
  const [wishError, setWishError] = useState('')

  const listRef = useRef(null)

  useEffect(() => {
    loadWishes()
  }, [])

  async function loadWishes() {
    const { data, error } = await supabase
      .from('wishes')
      .select('id, name, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error && data?.length) setWishes(data)
  }

  async function sendWish(e) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSending(true)
    setWishError('')
    const { data, error } = await supabase
      .from('wishes')
      .insert({ name: name.trim(), message: message.trim() })
      .select()
      .single()
    setSending(false)
    if (error) {
      setWishError('Gagal mengirim ucapan. Silakan coba lagi.')
    } else if (data) {
      setWishes((prev) => [data, ...prev])
      setName('')
      setMessage('')
      setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100)
    }
  }

  async function sendRSVP(e) {
    e.preventDefault()
    if (!rsvpName.trim()) return
    setRsvpSending(true)
    setRsvpError('')
    const { error } = await supabase
      .from('rsvp')
      .insert({ name: rsvpName.trim(), hadir, jumlah_tamu: hadir ? jumlah : 0 })
    setRsvpSending(false)
    if (error) {
      setRsvpError('Gagal mengirim konfirmasi. Silakan coba lagi.')
    } else {
      setRsvpSent(true)
    }
  }

  return (
    <div className="min-h-full bg-ivory pb-20">
      {/* Gallery Section (Light) */}
      <div className="pt-8 pb-8">
        <FadeIn className="px-6 text-center mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-mahogany/60 font-semibold mb-2">MEMORIES</p>
          <h2 className="font-serif text-4xl text-mahogany">Our Gallery</h2>
          <div className="w-12 h-[1px] bg-mahogany/20 mx-auto mt-4" />
        </FadeIn>

        {/* Masonry gallery */}
        <FadeIn className="px-4 grid grid-cols-2 gap-2">
          {PHOTOS.map(({ url, tall }, i) => (
            <div
              key={i}
              className={`rounded-xl overflow-hidden shadow-sm ${tall ? 'row-span-2' : ''}`}
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: tall ? '280px' : '130px',
              }}
            />
          ))}
        </FadeIn>
      </div>

      {/* RSVP & Wishes Section (Dark with Background) */}
      <div className="relative py-10 rounded-t-3xl -mt-6 overflow-hidden shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/together.jpeg" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-mahogany/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-mahogany via-transparent to-mahogany/45" />
        </div>

        <div className="relative z-10">
          {/* RSVP section */}
          <FadeIn className="mx-4 mb-16">
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.2em] uppercase text-ivory/60 font-semibold mb-2">RSVP</p>
              <h3 className="font-serif text-3xl text-ivory">Konfirmasi Kehadiran</h3>
              <div className="w-12 h-[1px] bg-ivory/20 mx-auto mt-4" />
            </div>

            {rsvpSent ? (
              <div className="bg-mahogany/90 border border-ivory/20 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-ivory/80 mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="font-serif text-xl text-ivory mb-2">Terima kasih, {rsvpName}!</p>
                <p className="text-sm text-ivory/60">Konfirmasi kehadiran Anda telah kami terima.</p>
              </div>
            ) : (
              <form onSubmit={sendRSVP} className="bg-mahogany/90 border border-ivory/20 rounded-2xl p-6 flex flex-col gap-5">
                <div>
                  <label className="text-xs tracking-wider text-ivory/60 mb-2 block uppercase">Nama Lengkap</label>
                  <input
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="w-full px-4 py-3 rounded-xl bg-mahogany border border-ivory/20 text-ivory text-sm outline-none focus:border-ivory/60 transition placeholder:text-ivory/40"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs tracking-wider text-ivory/60 mb-2 block uppercase">Kehadiran</label>
                  <div className="flex gap-3">
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setHadir(val)}
                        className={`flex-1 py-3 rounded-xl text-sm transition-all border ${
                          hadir === val ? 'bg-ivory text-mahogany border-ivory font-medium' : 'bg-mahogany text-ivory/60 border-ivory/20 hover:bg-ivory/10'
                        }`}
                      >
                        {val ? 'Hadir' : 'Tidak Hadir'}
                      </button>
                    ))}
                  </div>
                </div>

                {hadir && (
                  <div>
                    <label className="text-xs tracking-wider text-ivory/60 mb-2 block uppercase">Jumlah Tamu</label>
                    <div className="flex items-center gap-4 bg-mahogany border border-ivory/20 rounded-xl p-2 w-fit">
                      <button
                        type="button"
                        onClick={() => setJumlah((j) => Math.max(1, j - 1))}
                        className="w-8 h-8 rounded-lg bg-ivory/10 text-ivory flex items-center justify-center hover:bg-ivory/20 transition"
                      >
                        -
                      </button>
                      <span className="text-base text-ivory w-6 text-center">{jumlah}</span>
                      <button
                        type="button"
                        onClick={() => setJumlah((j) => Math.min(10, j + 1))}
                        className="w-8 h-8 rounded-lg bg-ivory/10 text-ivory flex items-center justify-center hover:bg-ivory/20 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {rsvpError && (
                  <p className="text-red-400 text-xs text-center -mt-1">{rsvpError}</p>
                )}
                <button
                  type="submit"
                  disabled={rsvpSending}
                  className="w-full py-4 rounded-xl bg-ivory hover:bg-ivory/90 text-mahogany font-medium text-sm active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
                >
                  {rsvpSending ? 'Mengirim...' : 'Kirim Konfirmasi'}
                </button>
              </form>
            )}
          </FadeIn>

          {/* Guestbook section */}
          <FadeIn className="mx-4">
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.2em] uppercase text-ivory/60 font-semibold mb-2">GUEST BOOK</p>
              <h3 className="font-serif text-3xl text-ivory">Wishes & Prayers</h3>
              <div className="w-12 h-[1px] bg-ivory/20 mx-auto mt-4" />
            </div>

            {/* Wish list */}
            <div ref={listRef} className="flex flex-col gap-4 mb-6 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {wishes.map((w, i) => (
                <div key={w.id} className="bg-mahogany/90 border border-ivory/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-ivory font-medium text-sm flex-shrink-0 shadow-inner`}
                    >
                      {w.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-ivory/90 truncate">{w.name}</p>
                      <p className="text-[10px] text-ivory/40 mt-0.5">{timeAgo(w.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-ivory/70 leading-relaxed">{w.message}</p>
                </div>
              ))}
            </div>

            {/* Send wish form */}
            <form onSubmit={sendWish} className="bg-mahogany/90 border border-ivory/20 rounded-2xl p-5 flex flex-col gap-4 mb-10">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-4 py-3 rounded-xl bg-mahogany border border-ivory/20 text-ivory text-sm outline-none focus:border-ivory/60 transition placeholder:text-ivory/40"
                required
              />
              {wishError && (
                <p className="text-red-400 text-xs -mt-1">{wishError}</p>
              )}
              <div className="flex gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan ucapan & doa Anda..."
                  rows={2}
                  className="flex-1 px-4 py-3 rounded-xl bg-mahogany border border-ivory/20 text-ivory text-sm outline-none focus:border-ivory/60 transition resize-none placeholder:text-ivory/40"
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-12 h-12 self-end rounded-xl bg-ivory hover:bg-ivory/90 text-mahogany flex items-center justify-center active:scale-[0.98] transition-all disabled:opacity-60 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    send
                  </span>
                </button>
              </div>
            </form>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
