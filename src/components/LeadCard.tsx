import { Building2, CalendarClock, GripVertical, Phone, UserRound } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import type { Negociacao } from '../types/crm'

export function LeadCard({ lead, onOpen }: { lead: Negociacao; onOpen: (lead: Negociacao) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  const success = lead.etapa === 'REUNIAO_MARCADA' || lead.etapa === 'GANHO'

  return (
    <article ref={setNodeRef} style={style} className={`lead-card ${isDragging ? 'lead-card--dragging' : ''}`} onClick={() => onOpen(lead)}>
      <div className="lead-card__top">
        <div className="lead-card__company"><Building2 size={16} /><strong>{lead.empresa?.nome ?? 'Empresa sem nome'}</strong></div>
        <button className="drag-handle" type="button" aria-label="Mover lead" onClick={(e) => e.stopPropagation()} {...listeners} {...attributes}><GripVertical size={18} /></button>
      </div>
      <div className="lead-card__contact"><UserRound size={15} /><span>{lead.contato?.nome ?? 'Contato não informado'}</span></div>
      {lead.contato?.cargo && <p className="lead-card__role">{lead.contato.cargo}</p>}
      <div className="lead-card__meta">
        <span><Phone size={14} />{lead.contato?.telefone || lead.empresa?.telefonePrincipal || 'Sem telefone'}</span>
        <span><CalendarClock size={14} />{lead.tentativas}/{lead.maxTentativas} tentativas</span>
      </div>
      <footer className="lead-card__footer">
        <span className={`interest interest--${(lead.nivelInteresse ?? 'SEM_INTERESSE').toLowerCase()}`}>{lead.nivelInteresse ? `Interesse ${lead.nivelInteresse.toLowerCase()}` : 'Não qualificado'}</span>
        {success && <span className="success-dot" title="Resultado positivo" aria-label="Resultado positivo" />}
      </footer>
    </article>
  )
}
