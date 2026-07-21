import { useEffect } from 'react'
import type { PropsWithChildren } from 'react'
import { X } from 'lucide-react'

type ModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
  size?: 'sm' | 'md' | 'lg'
}>

export function Modal({ open, title, onClose, size = 'md', children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar modal"><X size={20} /></button>
        </header>
        <div className="modal__content">{children}</div>
      </section>
    </div>
  )
}
