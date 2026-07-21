import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from './Modal'
import type { FaseAutomacao, LeadFormData } from '../types/crm'

const initial: LeadFormData = {
  empresaNome: '', empresaTelefone: '', dominioEmail: '', cenarioAtendimento: '',
  contatoNome: '', cargo: '', email: '', telefone: '', tipoContato: 'gatekeeper',
  faseAutomacaoInicial: 'BACKLOG', observacaoInicial: '', observacao: '',
}

export function LeadFormModal({ open, onClose, onSubmit, loading }: {
  open: boolean
  onClose: () => void
  onSubmit: (data: LeadFormData) => Promise<void>
  loading?: boolean
}) {
  const [form, setForm] = useState<LeadFormData>(initial)
  const update = <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => setForm((prev) => ({ ...prev, [key]: value }))

  async function submit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form)
    setForm(initial)
  }

  return (
    <Modal open={open} title="Adicionar novo lead" onClose={onClose} size="lg">
      <form className="lead-form" onSubmit={submit}>
        <fieldset>
          <legend>Informações iniciais</legend>
          <div className="form-grid">
            <label className="field field--wide"><span>Observação inicial</span><textarea rows={3} value={form.observacaoInicial} onChange={(e) => update('observacaoInicial', e.target.value)} /></label>
            <label className="field field--wide"><span>Nome da empresa *</span><input required maxLength={150} value={form.empresaNome} onChange={(e) => update('empresaNome', e.target.value)} /></label>
            <label className="field"><span>Telefone principal</span><input type="tel" value={form.empresaTelefone} onChange={(e) => update('empresaTelefone', e.target.value)} placeholder="+55..." /></label>
            <label className="field"><span>Domínio de e-mail</span><input value={form.dominioEmail} onChange={(e) => update('dominioEmail', e.target.value)} placeholder="empresa.com.br" /></label>
            <label className="field field--wide"><span>Cenário atual de atendimento</span><textarea rows={3} value={form.cenarioAtendimento} onChange={(e) => update('cenarioAtendimento', e.target.value)} /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Contato inicial</legend>
          <div className="form-grid">
            <label className="field"><span>Nome *</span><input required maxLength={150} value={form.contatoNome} onChange={(e) => update('contatoNome', e.target.value)} /></label>
            <label className="field"><span>Cargo</span><input value={form.cargo} onChange={(e) => update('cargo', e.target.value)} /></label>
            <label className="field"><span>E-mail</span><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
            <label className="field"><span>Telefone</span><input type="tel" value={form.telefone} onChange={(e) => update('telefone', e.target.value)} placeholder="+55..." /></label>
            <label className="field"><span>Tipo do contato</span><select value={form.tipoContato} onChange={(e) => update('tipoContato', e.target.value as 'gatekeeper' | 'decisor')}><option value="gatekeeper">Gatekeeper</option><option value="decisor">Decisor</option></select></label>
            <label className="field"><span>Piscina inicial</span><select value={form.faseAutomacaoInicial} onChange={(e) => update('faseAutomacaoInicial', e.target.value as FaseAutomacao)}><option value="BACKLOG">Backlog</option><option value="PRONTO_GATEKEEPER">Prontos para gatekeeper</option><option value="PRONTO_DECISOR">Prontos para decisor</option><option value="FINALIZADO">Finalização</option></select></label>
          </div>
        </fieldset>
        <div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Cancelar</button><button className="button button--primary" disabled={loading}>{loading ? 'Salvando...' : 'Adicionar lead'}</button></div>
      </form>
    </Modal>
  )
}