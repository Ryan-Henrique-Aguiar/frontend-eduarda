import { useEffect, useMemo, useState } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { LogOut, Plus, RefreshCw, Search, Sparkles } from 'lucide-react'
import { createLead, deleteNegociacao, getNegociacao, listNegociacoes, updateNegociacao } from '../api/crm'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LeadDetailsModal } from '../components/LeadDetailsModal'
import { LeadFormModal } from '../components/LeadFormModal'
import { PipelineColumn } from '../components/PipelineColumn'
import { useAuth } from '../contexts/AuthContext'
import type { FaseAutomacao, LeadFormData, Negociacao } from '../types/crm'

const pools: Array<{ id: FaseAutomacao; title: string; description: string }> = [
  { id: 'BACKLOG', title: 'Backlog', description: 'Leads aguardando preparação' },
  { id: 'PRONTO_GATEKEEPER', title: 'Prontos para Gatekeeper', description: 'Primeiro agente pode iniciar contato' },
  { id: 'PRONTO_DECISOR', title: 'Prontos para Decisor', description: 'Decisor identificado e pronto para abordagem' },
  { id: 'FINALIZADO', title: 'Finalização', description: 'Resultado comercial e próximos passos' },
]

function shouldEnqueueForStage(faseAutomacao: FaseAutomacao) {
  return faseAutomacao === 'PRONTO_GATEKEEPER' || faseAutomacao === 'PRONTO_DECISOR'
}

function normalizeLead(lead: Negociacao): Negociacao {
  return {
    ...lead,
    emFilaDiscagem: shouldEnqueueForStage(lead.faseAutomacao),
  }
}

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const [leads, setLeads] = useState<Negociacao[]>([])
  const [selected, setSelected] = useState<Negociacao | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const data = await listNegociacoes()
      setLeads(data.map(normalizeLead))
    }
    catch { setError('Não foi possível carregar as negociações. Confira a API e o CORS.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return leads
    return leads.filter((lead) => [lead.empresa?.nome, lead.contato?.nome, lead.contato?.email, lead.contato?.telefone].some((field) => field?.toLowerCase().includes(value)))
  }, [leads, query])

  function leadsForPool(pool: (typeof pools)[number]) {
    return filtered.filter((lead) => lead.faseAutomacao === pool.id)
  }

  async function handleOpen(lead: Negociacao) {
    setSelected(lead)
    try {
      const details = await getNegociacao(lead.id)
      if (details?.id) setSelected(normalizeLead({ ...lead, ...details, empresa: details.empresa ?? lead.empresa, contato: details.contato ?? lead.contato }))
    } catch { /* mantém os dados resumidos sem derrubar o modal */ }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const target = event.over?.id as FaseAutomacao | undefined
    if (!target) return
    const lead = leads.find((item) => item.id === event.active.id)
    if (!lead || lead.faseAutomacao === target) return
    const previous = lead.faseAutomacao
    const previousSelected = selected?.id === lead.id ? selected : null
    const nextFilaDiscagem = shouldEnqueueForStage(target)
    setLeads((items) => items.map((item) => item.id === lead.id ? { ...item, faseAutomacao: target, emFilaDiscagem: nextFilaDiscagem } : item))
    if (previousSelected) setSelected({ ...previousSelected, faseAutomacao: target, emFilaDiscagem: nextFilaDiscagem })
    try { await updateNegociacao(lead.id, { faseAutomacao: target, emFilaDiscagem: nextFilaDiscagem } as Partial<Negociacao>) }
    catch {
      setLeads((items) => items.map((item) => item.id === lead.id ? { ...item, faseAutomacao: previous, emFilaDiscagem: lead.emFilaDiscagem } : item))
      if (previousSelected) setSelected(previousSelected)
      setError('Não foi possível mover o lead. A alteração foi desfeita.')
    }
  }

  async function handleSaveObservation(leadId: string, value: string) {
    const previousLead = leads.find((item) => item.id === leadId)
    const previousSelected = selected?.id === leadId ? selected : null
    setLeads((items) => items.map((item) => item.id === leadId ? { ...item, observacao: value } : item))
    if (previousSelected) setSelected({ ...previousSelected, observacao: value })

    try {
      const updated = await updateNegociacao(leadId, { observacao: value })
      setLeads((items) => items.map((item) => item.id === leadId ? { ...item, ...updated, empresa: updated.empresa ?? item.empresa, contato: updated.contato ?? item.contato } : item))
      if (previousSelected) {
        setSelected({ ...previousSelected, ...updated, empresa: updated.empresa ?? previousSelected.empresa, contato: updated.contato ?? previousSelected.contato })
      }
    } catch {
      if (previousLead) {
        setLeads((items) => items.map((item) => item.id === leadId ? { ...item, ...previousLead } : item))
      }
      if (previousSelected) setSelected(previousSelected)
      setError('Não foi possível salvar a observação.')
    }
  }

  async function handleCreate(data: LeadFormData) {
    setSaving(true)
    try { await createLead(data); await load(); setFormOpen(false) }
    catch { setError('Não foi possível criar o lead. Verifique os campos aceitos pelo backend.') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true)
    try {
      await deleteNegociacao(selected.id)
      setLeads((items) => items.filter((item) => item.id !== selected.id))
      setSelected(null); setConfirmOpen(false)
    } catch { setError('O backend ainda não oferece DELETE /negociacoes/:id ou a exclusão falhou.') }
    finally { setSaving(false) }
  }

  const positive = leads.filter((lead) => ['REUNIAO_MARCADA', 'GANHO'].includes(lead.etapa)).length

  return <div className="app-shell"><header className="topbar"><div className="topbar__brand"><div className="brand-mark brand-mark--small"><Sparkles /></div><div><strong>CRM Eduarda</strong><span>Prospecção inteligente</span></div></div><div className="topbar__actions"><span className="user-pill">{user?.nome || user?.email}</span><button className="icon-button" title="Sair" onClick={signOut}><LogOut size={19} /></button></div></header><main className="dashboard"><section className="dashboard-heading"><div><p className="eyebrow">PIPELINE DE PROSPECÇÃO</p><h1>Operação de ligações</h1><p>Acompanhe a jornada do lead entre os agentes Gatekeeper e Decisor.</p></div><button className="button button--primary" onClick={() => setFormOpen(true)}><Plus size={18} />Adicionar lead</button></section><section className="summary-row"><div className="summary-card"><span>Total de leads</span><strong>{leads.length}</strong></div><div className="summary-card"><span>Prontos para ligar</span><strong>{leads.filter((l) => ['PRONTO_GATEKEEPER','PRONTO_DECISOR'].includes(l.faseAutomacao)).length}</strong></div><div className="summary-card"><span>Resultados positivos</span><strong>{positive}</strong></div><div className="summary-card"><span>Taxa positiva</span><strong>{leads.length ? Math.round((positive / leads.length) * 100) : 0}%</strong></div></section><section className="toolbar"><div className="search-box"><Search size={18} /><input placeholder="Buscar empresa, contato, e-mail ou telefone" value={query} onChange={(e) => setQuery(e.target.value)} /></div><button className="button button--secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={17} className={loading ? 'spin' : ''} />Atualizar</button></section>{error && <div className="alert alert--error">{error}</div>}{loading ? <div className="pipeline-loading"><span className="spinner" />Carregando pipeline...</div> : <DndContext onDragEnd={handleDragEnd}><div className="pipeline-board">{pools.map((pool) => <PipelineColumn key={pool.id} id={pool.id} title={pool.title} description={pool.description} leads={leadsForPool(pool)} onOpen={(lead) => void handleOpen(lead)} />)}</div></DndContext>}</main><LeadFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} loading={saving} /><LeadDetailsModal lead={selected} open={Boolean(selected)} onClose={() => setSelected(null)} onDelete={() => setConfirmOpen(true)} onSaveObservation={handleSaveObservation} /><ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => void handleDelete()} loading={saving} /></div>
}