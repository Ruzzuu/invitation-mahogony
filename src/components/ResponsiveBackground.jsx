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
      {mobileContain ? (
        <div className="absolute inset-0 flex items-center overflow-hidden sm:block">
          <img
            src={src}
            alt=""
            className="responsive-photo-main"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </div>
      ) : (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}
    </div>
  )
}
