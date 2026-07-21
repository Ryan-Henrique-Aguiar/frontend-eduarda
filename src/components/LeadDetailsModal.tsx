import { useEffect, useState } from 'react'
import { Mail, Phone, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import type { Negociacao } from '../types/crm'

export function LeadDetailsModal({ lead, open, onClose, onDelete, onSaveObservation }: {
  lead: Negociacao | null
  open: boolean
  onClose: () => void
  onDelete: () => void
  onSaveObservation?: (leadId: string, value: string) => Promise<void>
}) {
  const [observacao, setObservacao] = useState(lead?.observacao ?? '')
  const [savingObservation, setSavingObservation] = useState(false)

  useEffect(() => {
    setObservacao(lead?.observacao ?? '')
  }, [lead?.id, lead?.observacao, open])

  async function handleSaveObservation() {
    if (!lead || !onSaveObservation) return
    setSavingObservation(true)
    try {
      await onSaveObservation(lead.id, observacao)
    } finally {
      setSavingObservation(false)
    }
  }

  if (!lead) return null
  return (
    <Modal open={open} title={lead.empresa?.nome ?? 'Detalhes do lead'} onClose={onClose} size="lg">
      <div className="details-layout">
        <section className="details-card">
          <h3>Contato</h3>
          <dl className="details-list">
            <div><dt>Nome</dt><dd>{lead.contato?.nome ?? 'Não informado'}</dd></div>
            <div><dt>Cargo</dt><dd>{lead.contato?.cargo || 'Não informado'}</dd></div>
            <div><dt>Telefone</dt><dd><Phone size={15} />{lead.contato?.telefone || 'Não informado'}</dd></div>
            <div><dt>E-mail</dt><dd><Mail size={15} />{lead.contato?.email || 'Não informado'}</dd></div>
            <div><dt>Perfil</dt><dd>{lead.contato?.ehDecisor ? 'Decisor' : lead.contato?.ehGatekeeper ? 'Gatekeeper' : 'Não classificado'}</dd></div>
          </dl>
        </section>
        <section className="details-card">
          <h3>Negociação</h3>
          <dl className="details-list">
            <div><dt>Piscina</dt><dd>{lead.faseAutomacao ?? 'Não informada'}</dd></div>
            <div><dt>Etapa comercial</dt><dd>{lead.etapa ?? 'Não informada'}</dd></div>
            <div><dt>Interesse</dt><dd>{lead.nivelInteresse || 'Não avaliado'}</dd></div>
            <div><dt>Tentativas</dt><dd>{lead.tentativas} de {lead.maxTentativas}</dd></div>
            <div><dt>Em fila</dt><dd>{lead.emFilaDiscagem ? 'Sim' : 'Não'}</dd></div>
            <div><dt>Próxima tentativa</dt><dd>{lead.proximaTentativaPermitida ? new Date(lead.proximaTentativaPermitida).toLocaleString('pt-BR') : 'Não definida'}</dd></div>
          </dl>
        </section>
        <section className="details-card details-card--wide">
          <h3>Contexto comercial</h3>
          <p><strong>Dor:</strong> {lead.dorIdentificada || 'Ainda não identificada.'}</p>
          <p><strong>Objeção:</strong> {lead.objecaoPrincipal || 'Ainda não registrada.'}</p>
          <p><strong>Observação inicial:</strong> {lead.observacaoInicial || 'Sem observação inicial.'}</p>
          <label className="field field--wide"><span>Atualizar observação</span><textarea rows={4} value={observacao} onChange={(e) => setObservacao(e.target.value)} /></label>
          {onSaveObservation && <button className="button button--secondary" type="button" onClick={() => void handleSaveObservation()} disabled={savingObservation}>{savingObservation ? 'Salvando...' : 'Salvar observação'}</button>}
        </section>
        <section className="details-card details-card--wide">
          <h3>Interações da Eduarda</h3>
          <div className="timeline">
            {lead.interacoes?.length ? lead.interacoes.map((item) => <div className="timeline__item" key={item.id}><strong>{item.agente === 'gatekeeper' ? 'Agente Gatekeeper' : 'Agente Decisor'}</strong><span>{new Date(item.criadaEm).toLocaleString('pt-BR')}</span><p>{item.resumo || item.resultadoLigacao || 'Interação registrada.'}</p></div>) : <p className="muted">Nenhuma interação registrada.</p>}
          </div>
        </section>
      </div>
      <div className="modal-actions modal-actions--split"><button className="button button--danger-outline" type="button" onClick={onDelete}><Trash2 size={17} />Excluir</button><button className="button button--primary" type="button" onClick={onClose}>Fechar</button></div>
    </Modal>
  )
}