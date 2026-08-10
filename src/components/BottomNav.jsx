const TABS = [
  { id: 'home', icon: 'home', label: 'Beranda' },
  { id: 'couple', icon: 'favorite', label: 'Pasangan' },
  { id: 'events', icon: 'event', label: 'Acara' },
  { id: 'gallery', icon: 'photo_library', label: 'Galeri' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-ivory/90 backdrop-blur-md border-t border-mahogany/15 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {TABS.map(({ id, icon, label }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-0.5 flex-1 py-2 transition-all ${
                isActive ? 'text-mahogany' : 'text-mahogany/45'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-mahogany -translate-y-px" />
              )}
              <span
                className="material-symbols-outlined text-[22px] leading-none"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
