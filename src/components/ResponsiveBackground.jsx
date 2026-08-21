export default function ResponsiveBackground({ src, mobileContain = true, priority = false }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-mahogany" aria-hidden="true">
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-70 blur-2xl"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
      <img
        src={src}
        alt=""
        className={`absolute inset-0 h-full w-full object-center ${mobileContain ? 'object-contain sm:object-cover' : 'object-cover'}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  )
}
