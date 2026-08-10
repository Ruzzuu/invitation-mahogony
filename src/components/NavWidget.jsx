import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { id: 'home',   icon: 'home',          label: 'Beranda'  },
  { id: 'couple', icon: 'favorite',      label: 'Pasangan' },
  { id: 'events', icon: 'event',         label: 'Acara'    },
  { id: 'gallery',icon: 'photo_library', label: 'Galeri'   },
]

function NavIcon({ tab, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  const isActive = active === tab.id

  return (
    <div className="relative flex flex-col items-center">
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap
                       bg-mahogany text-ivory text-[10px] font-semibold tracking-wide
                       px-2 py-1 rounded-full pointer-events-none z-[80]"
          >
            {tab.label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => onClick(tab.id)}
        animate={hovered ? { scale: 1.18, rotate: -6 } : { scale: 1, rotate: 0 }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        className={`w-11 h-11 rounded-full flex items-center justify-center
                    border transition-colors duration-150 outline-none shadow-sm
                    ${isActive
                      ? 'bg-mahogany text-ivory border-mahogany'
                      : 'bg-ivory text-mahogany/45 border-mahogany/15'
                    }`}
        aria-label={tab.label}
      >
        <span
          className="material-symbols-outlined text-[20px] leading-none"
          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          {tab.icon}
        </span>
      </motion.button>
    </div>
  )
}

export default function NavWidget({ active, onChange }) {
  const [open, setOpen] = useState(false)

  function handleSelect(id) {
    setOpen(false)
    onChange(id)
  }

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-mahogany/50"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Popup pill ───────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="fixed inset-0 z-[70] flex items-center justify-center px-6"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="bg-ivory/95 backdrop-blur-md border border-mahogany/15 rounded-full py-4 px-5
                         shadow-xl flex items-center gap-3 w-full max-w-sm"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Label */}
              <span className="font-semibold text-sm tracking-widest text-mahogany/50 uppercase mr-1 select-none">
                Menu
              </span>

              {/* Nav icons */}
              <div className="flex items-center gap-2 flex-1 justify-center">
                {TABS.map(tab => (
                  <NavIcon
                    key={tab.id}
                    tab={tab}
                    active={active}
                    onClick={handleSelect}
                  />
                ))}
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-mahogany/10 border border-mahogany/15
                           flex items-center justify-center text-mahogany/70
                           text-lg leading-none outline-none ml-1"
                aria-label="Tutup"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ──────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ x: -3, y: -3 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-8 right-6 z-50 bg-ivory text-mahogany border border-mahogany/15
                   rounded-full px-5 py-3 shadow-lg flex items-center gap-2
                   font-semibold text-sm tracking-widest uppercase outline-none
                   select-none"
        style={{ transition: 'box-shadow 0.12s' }}
        aria-label="Buka navigasi"
      >
        <span className="material-symbols-outlined text-[20px] leading-none">
          {open ? 'close' : 'menu'}
        </span>
        MENU
      </motion.button>
    </>
  )
}
