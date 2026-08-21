import { useEffect, useState } from 'react'
import { Mail, Phone, Send, Trash2 } from 'lucide-react'
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
  const [rdStationOpen, setRdStationOpen] = useState(false)
  const [rdStationData, setRdStationData] = useState({ pipelineId: '', stageId: '', userId: '' })

  useEffect(() => {
    setObservacao(lead?.observacao ?? '')
  }, [lead?.id, lead?.observacao, open])

  useEffect(() => {
    if (!open) setRdStationOpen(false)
  }, [open])

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
            <div><dt>Telefone da empresa</dt><dd><Phone size={15} />{lead.empresa?.telefonePrincipal || 'Não informado'}</dd></div>
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
        <section className="details-card details-card--wide rd-station-card">
          <div>
            <h3>Enviar para o RD Station</h3>
            <p>Escolha o destino do lead no RD Station para preparar o envio.</p>
          </div>
          <button className="button button--rd-station" type="button" onClick={() => setRdStationOpen(true)}><Send size={17} />Enviar lead</button>
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
      <Modal open={rdStationOpen} title="Enviar lead para o RD Station" onClose={() => setRdStationOpen(false)} size="sm">
        <div className="rd-station-form">
          <p className="muted">Selecione os dados de destino para este lead.</p>
          <label className="field"><span>Pipeline</span><select value={rdStationData.pipelineId} onChange={(event) => setRdStationData({ ...rdStationData, pipelineId: event.target.value })}><option value="">Selecione o pipeline</option><option value="pipeline-comercial">Pipeline Comercial</option><option value="pipeline-enterprise">Pipeline Enterprise</option></select></label>
          <label className="field"><span>Stage</span><select value={rdStationData.stageId} onChange={(event) => setRdStationData({ ...rdStationData, stageId: event.target.value })}><option value="">Selecione o stage</option><option value="stage-new">Novo lead</option><option value="stage-qualified">Lead qualificado</option><option value="stage-meeting">Reunião marcada</option></select></label>
          <label className="field"><span>Usuário responsável</span><select value={rdStationData.userId} onChange={(event) => setRdStationData({ ...rdStationData, userId: event.target.value })}><option value="">Selecione o usuário</option><option value="user-eduarda">Eduarda</option><option value="user-comercial">Time comercial</option></select></label>
          <div className="modal-actions"><button className="button button--ghost" type="button" onClick={() => setRdStationOpen(false)}>Cancelar</button><button className="button button--rd-confirm" type="button" onClick={() => setRdStationOpen(false)} disabled={!rdStationData.pipelineId || !rdStationData.stageId || !rdStationData.userId}>Confirmar envio</button></div>
        </div>
      </Modal>
    </Modal>
  )
}