import { useEffect, useRef, useState } from 'react'
import { INVITATION_SLUG, supabase } from '../lib/supabase'
import FadeIn from './FadeIn'

const PHOTOS = [
  { url: '/foto1.jpeg', alt: 'Gallery photo 1' },
  { url: '/foto2.jpeg', alt: 'Gallery photo 2' },
  { url: '/foto3.jpeg', alt: 'Gallery photo 3' },
  { url: '/foto4.jpeg', alt: 'Gallery photo 4' },
  { url: '/foto5.jpeg', alt: 'Gallery photo 5' },
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

export default function GalleryRSVP() {
  const [wishes, setWishes] = useState([])
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
  const [accountCopied, setAccountCopied] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const listRef = useRef(null)

  useEffect(() => {
    loadWishes()
  }, [])

  useEffect(() => {
    if (!selectedPhoto) return

    function closeOnEscape(e) {
      if (e.key === 'Escape') setSelectedPhoto(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedPhoto])

  async function loadWishes() {
    const { data, error } = await supabase
      .from('wishes')
      .select('id, name, message, created_at')
      .eq('invitation_slug', INVITATION_SLUG)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      setWishError('Ucapan belum dapat dimuat. Silakan coba lagi.')
    } else {
      setWishes(data ?? [])
    }
  }

  async function sendWish(e) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    if (formData.get('company_website')) return

    if (!name.trim() || !message.trim()) return
    setSending(true)
    setWishError('')
    const { data, error } = await supabase
      .from('wishes')
      .insert({
        invitation_slug: INVITATION_SLUG,
        name: name.trim(),
        message: message.trim(),
      })
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

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText('1430025228550')
      setAccountCopied(true)
      setTimeout(() => setAccountCopied(false), 2000)
    } catch {
      setAccountCopied(false)
    }
  }

  async function sendRSVP(e) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    if (formData.get('company_website')) return

    if (!rsvpName.trim()) return
    setRsvpSending(true)
    setRsvpError('')
    const { error } = await supabase
      .from('rsvp')
      .insert({
        invitation_slug: INVITATION_SLUG,
        name: rsvpName.trim(),
        hadir,
        jumlah_tamu: hadir ? jumlah : 0,
      })
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
        <FadeIn className="px-4 columns-2 gap-3 space-y-3">
          {PHOTOS.map((photo, i) => (
            <button
              key={photo.url}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className="group mb-3 block w-full overflow-hidden rounded-xl bg-mahogany/5 shadow-sm outline-none ring-mahogany/20 transition active:scale-[0.98] focus-visible:ring-2"
              aria-label={`Buka foto galeri ${i + 1}`}
            >
              <img
                src={photo.url}
                alt={photo.alt}
                className="h-auto w-full transition duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </button>
          ))}
        </FadeIn>
      </div>

      {/* RSVP & Wishes Section (Dark with Background) */}
      <div
        className="relative py-10 rounded-t-3xl -mt-6 overflow-hidden bg-cover bg-center shadow-[0_-10px_20px_rgba(0,0,0,0.2)]"
        style={{ backgroundImage: 'url(/together.jpeg)' }}
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-mahogany/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-mahogany via-transparent to-mahogany/40" />

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
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute left-[-9999px] h-px w-px opacity-0"
                  aria-hidden="true"
                />

                <div>
                  <label className="text-xs tracking-wider text-ivory/60 mb-2 block uppercase">Nama Lengkap</label>
                  <input
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="w-full px-4 py-3 rounded-xl bg-mahogany border border-ivory/20 text-ivory text-sm outline-none focus:border-ivory/60 transition placeholder:text-ivory/40"
                    maxLength={100}
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

          {/* Digital gift section */}
          <FadeIn className="mx-4 mb-16">
            <div className="text-center mb-7">
              <p className="text-xs tracking-[0.2em] uppercase text-ivory/60 font-semibold mb-2">WEDDING GIFT</p>
              <h3 className="font-serif text-3xl text-ivory">Hadiah Digital</h3>
              <div className="w-12 h-[1px] bg-ivory/20 mx-auto mt-4" />
            </div>

            <p className="mx-auto mb-6 max-w-sm text-center text-sm leading-relaxed text-ivory/70">
              Tanpa mengurangi rasa hormat, bagi kerabat yang ingin memberikan hadiah atau tanda kasih secara digital, dapat dikirimkan melalui rekening berikut:
            </p>

            <div className="relative overflow-hidden rounded-2xl border border-ivory/20 bg-mahogany/90 p-6 shadow-xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-ivory/10" />
              <div className="absolute -bottom-14 -left-8 h-36 w-36 rounded-full border border-ivory/10" />

              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-full bg-ivory/10 text-ivory">
                      account_balance
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/50">Bank</p>
                      <p className="font-serif text-xl font-semibold text-ivory">Mandiri</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-ivory/30">credit_card</span>
                </div>

                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-ivory/50">Nomor Rekening</p>
                <p className="mb-5 font-serif text-2xl tracking-[0.12em] text-ivory">1430025228550</p>

                <div className="flex flex-col gap-4 border-t border-ivory/15 pt-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-ivory/50">Atas Nama</p>
                    <p className="text-sm font-semibold tracking-wide text-ivory">SITI NUR ALFATIHANA</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyAccountNumber}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-ivory px-4 py-2.5 text-xs font-semibold text-mahogany transition active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">
                      {accountCopied ? 'check' : 'content_copy'}
                    </span>
                    {accountCopied ? 'Tersalin' : 'Salin Rekening'}
                  </button>
                </div>
              </div>
            </div>
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
              {wishes.length === 0 ? (
                <div className="bg-mahogany/70 border border-ivory/15 rounded-2xl px-5 py-8 text-center">
                  <p className="text-sm text-ivory/60">Belum ada ucapan.</p>
                  <p className="text-xs text-ivory/40 mt-1">Jadilah yang pertama memberikan doa terbaik.</p>
                </div>
              ) : (
                wishes.map((w, i) => (
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
                ))
              )}
            </div>

            {/* Send wish form */}
            <form onSubmit={sendWish} className="bg-mahogany/90 border border-ivory/20 rounded-2xl p-5 flex flex-col gap-4 mb-10">
              <input
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute left-[-9999px] h-px w-px opacity-0"
                aria-hidden="true"
              />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-4 py-3 rounded-xl bg-mahogany border border-ivory/20 text-ivory text-sm outline-none focus:border-ivory/60 transition placeholder:text-ivory/40"
                maxLength={100}
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
                  maxLength={1000}
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

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-mahogany/95 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-ivory text-mahogany shadow-lg transition hover:bg-ivory/90 active:scale-95"
            aria-label="Tutup foto"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.alt}
            className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
