export default function MusicButton({ playing, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-ivory shadow-lg flex items-center justify-center text-mahogany transition-all active:scale-90 border border-mahogany/15 ${
        playing ? 'animate-spin-slow' : 'spin-paused'
      }`}
      aria-label="Toggle music"
    >
      <span className="material-symbols-outlined text-[20px]">
        {playing ? 'music_note' : 'music_off'}
      </span>
    </button>
  )
}
