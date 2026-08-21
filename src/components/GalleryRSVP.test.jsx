import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GalleryRSVP from './GalleryRSVP'

const db = vi.hoisted(() => ({
  from: vi.fn(),
  loadSelect: vi.fn(),
  loadEq: vi.fn(),
  loadOrder: vi.fn(),
  loadLimit: vi.fn(),
  wishInsert: vi.fn(),
  wishInsertSelect: vi.fn(),
  wishSingle: vi.fn(),
  rsvpInsert: vi.fn(),
  loadResult: { data: [], error: null },
  wishResult: { data: null, error: null },
  rsvpResult: { error: null },
}))

vi.mock('../lib/supabase', () => ({
  INVITATION_SLUG: 'alfa-rizaldy',
  supabase: { from: db.from },
}))

vi.mock('./FadeIn', () => ({
  default: ({ children, className = '' }) => <div className={className}>{children}</div>,
}))

vi.mock('./ResponsiveBackground', () => ({
  default: () => <div data-testid="responsive-background" />,
}))

function configureSupabaseMock() {
  db.loadLimit.mockImplementation(() => Promise.resolve(db.loadResult))
  db.loadOrder.mockReturnValue({ limit: db.loadLimit })
  db.loadEq.mockReturnValue({ order: db.loadOrder })
  db.loadSelect.mockReturnValue({ eq: db.loadEq })

  db.wishSingle.mockImplementation(() => Promise.resolve(db.wishResult))
  db.wishInsertSelect.mockReturnValue({ single: db.wishSingle })
  db.wishInsert.mockReturnValue({ select: db.wishInsertSelect })

  db.rsvpInsert.mockImplementation(() => Promise.resolve(db.rsvpResult))

  db.from.mockImplementation((table) => {
    if (table === 'wishes') {
      return { select: db.loadSelect, insert: db.wishInsert }
    }
    if (table === 'rsvp') {
      return { insert: db.rsvpInsert }
    }
    throw new Error(`Unexpected table: ${table}`)
  })
}

async function renderGallery() {
  const view = render(<GalleryRSVP />)
  await waitFor(() => expect(db.loadLimit).toHaveBeenCalled())
  return view
}

beforeEach(() => {
  db.loadResult = { data: [], error: null }
  db.wishResult = {
    data: {
      id: 'wish-new',
      name: 'Tamu Baru',
      message: 'Semoga bahagia',
      created_at: new Date().toISOString(),
    },
    error: null,
  }
  db.rsvpResult = { error: null }
  configureSupabaseMock()
})

describe('GalleryRSVP database isolation', () => {
  it('loads only wishes for alfa-rizaldy, newest first, limited to 50', async () => {
    await renderGallery()

    expect(db.from).toHaveBeenCalledWith('wishes')
    expect(db.loadSelect).toHaveBeenCalledWith('id, name, message, created_at')
    expect(db.loadEq).toHaveBeenCalledWith('invitation_slug', 'alfa-rizaldy')
    expect(db.loadOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(db.loadLimit).toHaveBeenCalledWith(50)
  })

  it('renders database messages as text instead of executable HTML', async () => {
    const maliciousMessage = '<img src=x onerror="alert(1)">'
    db.loadResult = {
      data: [{
        id: 'xss-test',
        name: '<script>Guest</script>',
        message: maliciousMessage,
        created_at: new Date().toISOString(),
      }],
      error: null,
    }

    const { container } = await renderGallery()

    expect(screen.getByText(maliciousMessage)).toBeInTheDocument()
    expect(screen.getByText('<script>Guest</script>')).toBeInTheDocument()
    expect(container.querySelector('script')).not.toBeInTheDocument()
    expect(container.querySelector('img[src="x"]')).not.toBeInTheDocument()
  })

  it('shows a safe empty state when there are no wishes', async () => {
    await renderGallery()

    expect(screen.getByText('Belum ada ucapan.')).toBeInTheDocument()
    expect(screen.getByText('Jadilah yang pertama memberikan doa terbaik.')).toBeInTheDocument()
  })

  it('shows a load error without crashing the page', async () => {
    db.loadResult = { data: null, error: { message: 'network error' } }
    await renderGallery()

    expect(screen.getByText('Ucapan belum dapat dimuat. Silakan coba lagi.')).toBeInTheDocument()
  })
})

describe('Wishes form security and reliability', () => {
  it('sends trimmed input with the correct invitation slug', async () => {
    const user = userEvent.setup()
    await renderGallery()

    await user.type(screen.getByPlaceholderText('Nama Anda'), '  Budi  ')
    await user.type(screen.getByPlaceholderText('Tuliskan ucapan & doa Anda...'), '  Semoga bahagia  ')
    await user.click(screen.getByRole('button', { name: 'Kirim ucapan' }))

    await waitFor(() => {
      expect(db.wishInsert).toHaveBeenCalledWith({
        invitation_slug: 'alfa-rizaldy',
        name: 'Budi',
        message: 'Semoga bahagia',
      })
    })
    expect(db.wishInsertSelect).toHaveBeenCalledWith('id, name, message, created_at')
  })

  it('silently rejects a bot that fills the hidden honeypot', async () => {
    await renderGallery()

    const nameInput = screen.getByPlaceholderText('Nama Anda')
    const form = nameInput.closest('form')
    fireEvent.change(nameInput, { target: { value: 'Spam Bot' } })
    fireEvent.change(screen.getByPlaceholderText('Tuliskan ucapan & doa Anda...'), { target: { value: 'Spam link' } })
    fireEvent.change(form.querySelector('[name="company_website"]'), { target: { value: 'https://spam.test' } })
    fireEvent.submit(form)

    expect(db.wishInsert).not.toHaveBeenCalled()
  })

  it('rejects whitespace-only values before calling Supabase', async () => {
    await renderGallery()

    const nameInput = screen.getByPlaceholderText('Nama Anda')
    const form = nameInput.closest('form')
    fireEvent.change(nameInput, { target: { value: '   ' } })
    fireEvent.change(screen.getByPlaceholderText('Tuliskan ucapan & doa Anda...'), { target: { value: '\n  ' } })
    fireEvent.submit(form)

    expect(db.wishInsert).not.toHaveBeenCalled()
  })

  it('enforces client-side length and required attributes', async () => {
    await renderGallery()

    const nameInput = screen.getByPlaceholderText('Nama Anda')
    const messageInput = screen.getByPlaceholderText('Tuliskan ucapan & doa Anda...')

    expect(nameInput).toBeRequired()
    expect(nameInput).toHaveAttribute('maxlength', '100')
    expect(messageInput).toBeRequired()
    expect(messageInput).toHaveAttribute('maxlength', '1000')
  })

  it('locks rapid duplicate submissions until the first request finishes', async () => {
    let resolveInsert
    db.wishSingle.mockImplementation(() => new Promise((resolve) => {
      resolveInsert = resolve
    }))
    await renderGallery()

    const nameInput = screen.getByPlaceholderText('Nama Anda')
    const form = nameInput.closest('form')
    fireEvent.change(nameInput, { target: { value: 'Budi' } })
    fireEvent.change(screen.getByPlaceholderText('Tuliskan ucapan & doa Anda...'), { target: { value: 'Semoga bahagia' } })

    fireEvent.submit(form)
    fireEvent.submit(form)

    expect(db.wishInsert).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Kirim ucapan' })).toBeDisabled()

    resolveInsert(db.wishResult)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kirim ucapan' })).not.toBeDisabled())
  })

  it('shows an error and unlocks the button after a failed request', async () => {
    db.wishResult = { data: null, error: { message: 'insert failed' } }
    const user = userEvent.setup()
    await renderGallery()

    await user.type(screen.getByPlaceholderText('Nama Anda'), 'Budi')
    await user.type(screen.getByPlaceholderText('Tuliskan ucapan & doa Anda...'), 'Semoga bahagia')
    await user.click(screen.getByRole('button', { name: 'Kirim ucapan' }))

    expect(await screen.findByText('Gagal mengirim ucapan. Silakan coba lagi.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kirim ucapan' })).not.toBeDisabled()
  })
})

describe('RSVP form security and reliability', () => {
  it('submits attendance with the correct slug and guest count', async () => {
    const user = userEvent.setup()
    await renderGallery()

    await user.type(screen.getByPlaceholderText('Masukkan nama Anda'), '  Keluarga Budi  ')
    await user.click(screen.getByText('+'))
    await user.click(screen.getByRole('button', { name: 'Kirim Konfirmasi' }))

    await waitFor(() => {
      expect(db.rsvpInsert).toHaveBeenCalledWith({
        invitation_slug: 'alfa-rizaldy',
        name: 'Keluarga Budi',
        hadir: true,
        jumlah_tamu: 2,
      })
    })
    expect(screen.getByText('Terima kasih, Keluarga Budi!')).toBeInTheDocument()
  })

  it('stores zero guests when the invitee cannot attend', async () => {
    const user = userEvent.setup()
    await renderGallery()

    await user.type(screen.getByPlaceholderText('Masukkan nama Anda'), 'Budi')
    await user.click(screen.getByRole('button', { name: 'Tidak Hadir' }))
    await user.click(screen.getByRole('button', { name: 'Kirim Konfirmasi' }))

    await waitFor(() => {
      expect(db.rsvpInsert).toHaveBeenCalledWith(expect.objectContaining({
        hadir: false,
        jumlah_tamu: 0,
      }))
    })
  })

  it('rejects RSVP bots that fill the hidden honeypot', async () => {
    await renderGallery()

    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda')
    const form = nameInput.closest('form')
    fireEvent.change(nameInput, { target: { value: 'Spam Bot' } })
    fireEvent.change(form.querySelector('[name="company_website"]'), { target: { value: 'spam' } })
    fireEvent.submit(form)

    expect(db.rsvpInsert).not.toHaveBeenCalled()
  })

  it('locks rapid duplicate RSVP submissions', async () => {
    let resolveInsert
    db.rsvpInsert.mockImplementation(() => new Promise((resolve) => {
      resolveInsert = resolve
    }))
    await renderGallery()

    const nameInput = screen.getByPlaceholderText('Masukkan nama Anda')
    const form = nameInput.closest('form')
    fireEvent.change(nameInput, { target: { value: 'Budi' } })

    fireEvent.submit(form)
    fireEvent.submit(form)

    expect(db.rsvpInsert).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Mengirim...' })).toBeDisabled()

    resolveInsert({ error: null })
    expect(await screen.findByText('Terima kasih, Budi!')).toBeInTheDocument()
  })

  it('shows an RSVP error instead of a false success state', async () => {
    db.rsvpResult = { error: { message: 'insert failed' } }
    const user = userEvent.setup()
    await renderGallery()

    await user.type(screen.getByPlaceholderText('Masukkan nama Anda'), 'Budi')
    await user.click(screen.getByRole('button', { name: 'Kirim Konfirmasi' }))

    expect(await screen.findByText('Gagal mengirim konfirmasi. Silakan coba lagi.')).toBeInTheDocument()
    expect(screen.queryByText('Terima kasih, Budi!')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kirim Konfirmasi' })).not.toBeDisabled()
  })
})

describe('Gallery interactions', () => {
  it('opens a photo popup and closes it with Escape', async () => {
    const user = userEvent.setup()
    await renderGallery()

    await user.click(screen.getByRole('button', { name: 'Buka foto galeri 1' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByAltText('Gallery photo 1')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
