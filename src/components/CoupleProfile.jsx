import FadeIn from './FadeIn'

const GROOM_PHOTO = '/groom.png'
const BRIDE_PHOTO = '/bride.png'

function PersonCard({ photo, name, parents }) {
  return (
    <FadeIn className="mx-6 mb-6 text-center">
      {/* Large portrait photo */}
      <div className="flex justify-center mb-4">
        <div
          className="w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-lg"
          style={{ backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      </div>

      {/* Name */}
      <h2 className="font-serif text-2xl text-mahogany tracking-widest mb-2 uppercase">{name}</h2>

      {/* Parents */}
      <p className="text-xs text-mahogany/70 leading-relaxed max-w-[250px] mx-auto">
        {parents}
      </p>
    </FadeIn>
  )
}

export default function CoupleProfile() {
  return (
    <div className="min-h-full bg-ivory pb-6 pt-8 rounded-t-3xl -mt-6 relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
      {/* Header */}
      <FadeIn className="px-8 text-center mb-6">
        <p className="text-xs tracking-[0.2em] uppercase text-mahogany/60 font-semibold mb-4">THE COUPLE</p>
        <p className="text-xs text-mahogany/80 leading-relaxed">
          By the grace of God,<br />
          we are pleased to announce<br />
          our wedding to you, our<br />
          family and friends:
        </p>
      </FadeIn>

      {/* Bride */}
      <PersonCard
        photo={BRIDE_PHOTO}
        name="Siti Nur Alfatihana, S.KM."
        parents="Putri dari Bpk. Alit Tasrifuddin dan Ibu Riana Resmi"
      />

      {/* Groom */}
      <PersonCard
        photo={GROOM_PHOTO}
        name="Mochammad Rizaldy Irawan, A.Md."
        parents="Putra dari Bpk. Mochamad Erwan Boedi Santoso, S.Sos. dan Ibu Faizah Juniati"
      />
    </div>
  )
}
