import { useDroppable } from '@dnd-kit/core'
import type { FaseAutomacao, Negociacao } from '../types/crm'
import { LeadCard } from './LeadCard'

export function PipelineColumn({ id, title, description, leads, onOpen }: {
  id: FaseAutomacao
  title: string
  description: string
  leads: Negociacao[]
  onOpen: (lead: Negociacao) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <section ref={setNodeRef} className={`pipeline-column ${isOver ? 'pipeline-column--over' : ''}`}>
      <header className="pipeline-column__header">
        <div><h2>{title}</h2><p>{description}</p></div>
        <span className="pipeline-count">{leads.length}</span>
      </header>
      <div className="pipeline-column__body">
        {leads.length ? leads.map((lead) => <LeadCard key={lead.id} lead={lead} onOpen={onOpen} />) : <div className="empty-column">Arraste um lead para esta piscina</div>}
      </div>
    </section>
  )
}