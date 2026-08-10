import FadeIn from './FadeIn'

export default function Closing() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center select-none text-ivory py-20 px-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(/together.jpeg)' }}
      />
      
      {/* Overlay - Darker for the closing section to make text pop */}
      <div className="absolute inset-0 bg-mahogany/80 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-mahogany via-transparent to-mahogany/95 z-0" />

      {/* Ornate CSS Borders (Top Left, Top Right, Bottom Left, Bottom Right) */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-ivory rounded-tl-3xl opacity-70 z-0" />
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-ivory rounded-tr-3xl opacity-70 z-0" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-ivory rounded-bl-3xl opacity-70 z-0" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-ivory rounded-br-3xl opacity-70 z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-10">
        
        <FadeIn>
          <p className="font-serif text-lg md:text-xl text-ivory/90 leading-relaxed drop-shadow-md">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami<br/>
            apabila Bapak/Ibu/Saudara/i berkenan hadir untuk<br/>
            memberikan do'a restu kepada putra-putri kami.
          </p>
        </FadeIn>

        <FadeIn className="anim-delay-100">
          <p className="font-serif text-xl md:text-2xl text-ivory drop-shadow-lg">
            Wassalamu'alaikum Warahmatullahi Wabarakatuh
          </p>
        </FadeIn>

        <FadeIn className="anim-delay-200 w-full mt-4">
          <p className="font-serif text-2xl md:text-3xl text-ivory mb-8 drop-shadow-md">
            Kami yang berbahagia
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            {/* Family 1 */}
            <div className="text-center">
              <p className="font-serif text-lg md:text-xl text-ivory/90 border-b border-ivory/40 pb-1 mb-1 inline-block">
                Kel. Bpk. Mochamad Erwan Boedi Santoso, S.Sos.
              </p>
              <p className="font-serif text-base md:text-lg text-ivory/80">
                Ibu Faizah Juniati
              </p>
            </div>

            {/* Family 2 */}
            <div className="text-center">
              <p className="font-serif text-lg md:text-xl text-ivory/90 border-b border-ivory/40 pb-1 mb-1 inline-block">
                Kel. Bpk. Alit Tasrifuddin
              </p>
              <p className="font-serif text-base md:text-lg text-ivory/80">
                Ibu Riana Resmi
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Music Credit */}
        <FadeIn className="anim-delay-300 mt-16">
          <p className="text-xs tracking-[0.2em] uppercase text-ivory/50 font-semibold mb-1">
            Music:
          </p>
          <p className="font-serif text-sm text-ivory/70 italic">
            Nadhif Basalamah - kota ini tak sama tanpamu
          </p>
        </FadeIn>

      </div>
    </div>
  )
}
