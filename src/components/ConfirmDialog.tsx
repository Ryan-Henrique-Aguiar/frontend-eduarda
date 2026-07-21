import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'

export function ConfirmDialog({ open, onClose, onConfirm, loading }: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}) {
  return (
    <Modal open={open} title="Excluir lead" onClose={onClose} size="sm">
      <div className="confirm-dialog">
        <div className="confirm-dialog__icon"><AlertTriangle size={24} /></div>
        <p>Tem certeza de que deseja excluir este lead? Essa ação não poderá ser desfeita.</p>
        <div className="modal-actions">
          <button className="button button--ghost" type="button" onClick={onClose}>Cancelar</button>
          <button className="button button--danger" type="button" onClick={onConfirm} disabled={loading}>{loading ? 'Excluindo...' : 'Excluir lead'}</button>
        </div>
      </div>
    </Modal>
  )
}
