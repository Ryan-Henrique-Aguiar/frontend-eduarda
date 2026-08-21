import { http } from './http'
import type { FaseAutomacao, LeadFormData, LoginResponse, Negociacao, PaginatedResponse } from '../types/crm'

function getFilaDiscagem(faseAutomacao: FaseAutomacao) {
  return faseAutomacao === 'PRONTO_GATEKEEPER' || faseAutomacao === 'PRONTO_DECISOR'
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/auth/login', { email, senha })
  return data
}

export async function getMe() {
  const { data } = await http.get('/auth/me')
  return data
}

export async function listNegociacoes(): Promise<Negociacao[]> {
  const { data } = await http.get<PaginatedResponse<Negociacao> | Negociacao[]>('/negociacoes?page=1&pageSize=50')
  if (Array.isArray(data)) return data
  return data.data ?? data.items ?? data.itens ?? data.negociacoes ?? []
}

export async function getNegociacao(id: string): Promise<Negociacao | null> {
  const response = await http.get<Negociacao | { item?: Negociacao; negociacao?: Negociacao } | null>(`/negociacoes/${id}`)
  if (response.status === 204 || !response.data) return null
  if ('item' in response.data && response.data.item) return response.data.item
  if ('negociacao' in response.data && response.data.negociacao) return response.data.negociacao
  return response.data as Negociacao
}

export async function updateNegociacao(id: string, payload: Partial<Negociacao>): Promise<Negociacao> {
  const { data } = await http.patch<Negociacao>(`/negociacoes/${id}`, payload)
  return data
}

export async function deleteNegociacao(id: string): Promise<void> {
  await http.delete(`/negociacoes/${id}`)
}

export async function createLead(form: LeadFormData): Promise<Negociacao> {
  const empresa = await http.post('/empresas', {
    nome: form.empresaNome,
    telefonePrincipal: form.empresaTelefone || undefined,
    dominioEmail: form.dominioEmail || undefined,
    cenarioAtendimento: form.cenarioAtendimento || undefined,
  })

  const contato = await http.post('/contatos', {
    empresaId: empresa.data.id,
    nome: form.contatoNome || '',
    cargo: form.cargo || undefined,
    email: form.email || undefined,
    telefone: form.telefone || undefined,
    ehGatekeeper: form.tipoContato === 'gatekeeper',
    ehDecisor: form.tipoContato === 'decisor',
  })

  const emFilaDiscagem = getFilaDiscagem(form.faseAutomacaoInicial)

  const negociacao = await http.post<Negociacao>('/negociacoes', {
    empresaId: empresa.data.id,
    contatoId: contato.data.id,
    origem: 'ATIVA',
    faseAutomacao: form.faseAutomacaoInicial,
    emFilaDiscagem,
    observacaoInicial: form.observacaoInicial || undefined,
    observacao: form.observacao || undefined,
  })

  if (form.faseAutomacaoInicial !== 'BACKLOG' || form.observacao || form.observacaoInicial) {
    const { data } = await http.patch<Negociacao>(`/negociacoes/${negociacao.data.id}`, {
      faseAutomacao: form.faseAutomacaoInicial,
      emFilaDiscagem,
      observacaoInicial: form.observacaoInicial || undefined,
      observacao: form.observacao || undefined,
    })
    return data
  }

  return negociacao.data
}