export type EtapaNegociacao =
  | 'PROSPECCAO'
  | 'PRONTO_GATEKEEPER'
  | 'PRONTO_DECISOR'
  | 'EM_LIGACAO'
  | 'QUALIFICADO'
  | 'REUNIAO_MARCADA'
  | 'SEM_INTERESSE'
  | 'PERDIDO'
  | 'GANHO'

export type FaseAutomacao = 'BACKLOG' | 'PRONTO_GATEKEEPER' | 'PRONTO_DECISOR' | 'FINALIZADO'

export type NivelInteresse = 'ALTO' | 'MEDIO' | 'BAIXO' | 'SEM_INTERESSE'

export interface Empresa {
  id: string
  nome: string
  telefonePrincipal?: string | null
  dominioEmail?: string | null
  cenarioAtendimento?: string | null
}

export interface Contato {
  id: string
  empresaId: string
  nome: string
  cargo?: string | null
  email?: string | null
  telefone?: string | null
  ehGatekeeper: boolean
  ehDecisor: boolean
  consentimentoLigacao: boolean
  naoLigarNovamente: boolean
}

export interface Negociacao {
  id: string
  empresaId: string
  contatoId: string
  origem: 'ATIVA' | 'RECEPTIVA'
  etapa: EtapaNegociacao
  nivelInteresse?: NivelInteresse | null
  faseAutomacao: FaseAutomacao
  tentativas: number
  maxTentativas: number
  proximaTentativaPermitida: string
  ultimaTentativaEm?: string | null
  emFilaDiscagem: boolean
  dorIdentificada?: string | null
  objecaoPrincipal?: string | null
  observacao?: string | null
  observacaoInicial?: string | null
  criadoEm: string
  atualizadoEm: string
  empresa: Empresa
  contato: Contato
  tentativasLigacao?: TentativaLigacao[]
  interacoes?: InteracaoEduarda[]
}

export interface TentativaLigacao {
  id: string
  numero: number
  resultado?: string | null
  dialerCallId?: string | null
  duracaoSegundos?: number | null
  iniciadaEm: string
  finalizadaEm?: string | null
}

export interface InteracaoEduarda {
  id: string
  agente: 'gatekeeper' | 'decisor' | string
  transferida: boolean
  interesse: boolean
  nivelInteresse?: NivelInteresse | null
  aceitouReuniao: boolean
  horarioReuniaoSugerido?: string | null
  solicitouRetorno: boolean
  resultadoLigacao?: string | null
  resumo?: string | null
  criadaEm: string
}

export interface LoginResponse {
  token: string
  usuario?: {
    id: string
    nome: string
    email: string
    papel: 'ADMIN' | 'VENDEDOR'
  }
}

export interface PaginatedResponse<T> {
  data?: T[]
  items?: T[]
  itens?: T[]
  negociacoes?: T[]
  page?: number
  pageSize?: number
  total?: number
}

export interface LeadFormData {
  empresaNome: string
  empresaTelefone: string
  dominioEmail: string
  cenarioAtendimento: string
  contatoNome: string
  cargo: string
  email: string
  telefone: string
  tipoContato: 'gatekeeper' | 'decisor'
  faseAutomacaoInicial: FaseAutomacao
  observacaoInicial: string
  observacao: string
}