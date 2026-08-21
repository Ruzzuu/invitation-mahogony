export default function ResponsiveBackground({ src, mobileContain = true, priority = false }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-mahogany" aria-hidden="true">
      {mobileContain ? (
        <img
          src={src}
          alt=""
          className="responsive-photo-main"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
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
