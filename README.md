# CRM Eduarda — Frontend

Frontend em React + TypeScript para visualizar e movimentar leads em um pipeline no estilo RD Station.

## Recursos implementados

- Login obrigatório usando `POST /auth/login`.
- Validação da sessão usando `GET /auth/me`.
- Token JWT mantido em `sessionStorage` e enviado por interceptor Axios.
- Nenhuma API key de serviço exposta no frontend.
- Pipeline com quatro piscinas:
  - Backlog
  - Prontos para Gatekeeper
  - Prontos para Decisor
  - Finalização
- Cards de leads com drag-and-drop.
- Atualização otimista da etapa via `PATCH /negociacoes/:id`.
- Modal para cadastrar empresa, contato e negociação.
- Modal de detalhes com informações comerciais e interações da Eduarda.
- Confirmação antes da exclusão.
- Busca por empresa, contato, e-mail ou telefone.
- Indicador verde para resultados positivos (`REUNIAO_MARCADA` ou `GANHO`).
- Layout responsivo e CSS separado.

## Executar

```bash
cp .env.example .env
npm install
npm run dev
```

Configure:

```env
VITE_API_BASE_URL=http://localhost:3333
```

## Endpoints já utilizados

- `POST /auth/login`
- `GET /auth/me`
- `GET /negociacoes?page=1&pageSize=200`
- `GET /negociacoes/:id`
- `POST /empresas`
- `POST /contatos`
- `POST /negociacoes`
- `PATCH /negociacoes/:id`

## Endpoints ou ajustes necessários no backend

### 1. Exclusão de negociação

O frontend está preparado para:

```http
DELETE /negociacoes/:id
```

Esse endpoint não aparece na documentação fornecida. Recomenda-se exclusão transacional da negociação e dos registros dependentes, respeitando as regras de auditoria. Outra opção mais segura é implementar arquivamento lógico.

### 2. Etapas específicas do pipeline

O frontend usa as etapas:

- `PROSPECCAO`
- `PRONTO_GATEKEEPER`
- `PRONTO_DECISOR`
- `QUALIFICADO`

No schema atual, `PRONTO_GATEKEEPER` e `PRONTO_DECISOR` não existem em `EtapaNegociacao`. Para representar fielmente as piscinas, adicione os dois valores ao enum e gere uma migration.

Alternativa sem alterar o enum: criar um campo separado, por exemplo:

```prisma
faseAutomacao FaseAutomacao @default(BACKLOG)
```

Isso separa o status comercial da posição operacional do lead.

### 3. Cadastro atômico de lead

Hoje o frontend precisa chamar, em sequência:

1. `POST /empresas`
2. `POST /contatos`
3. `POST /negociacoes`
4. opcionalmente `PATCH /negociacoes/:id`

Recomenda-se um endpoint transacional:

```http
POST /leads
```

Ele deve criar empresa, contato e negociação em uma única transação Prisma. Assim não ficam empresas ou contatos órfãos quando uma chamada intermediária falha.

### 4. Resposta expandida das negociações

Para os cards, `GET /negociacoes` deve retornar ao menos:

```json
{
  "id": "uuid",
  "etapa": "PROSPECCAO",
  "tentativas": 0,
  "maxTentativas": 5,
  "nivelInteresse": null,
  "empresa": {
    "id": "uuid",
    "nome": "Empresa",
    "telefonePrincipal": "+55..."
  },
  "contato": {
    "id": "uuid",
    "nome": "Contato",
    "cargo": "Cargo",
    "telefone": "+55...",
    "email": "email@empresa.com"
  }
}
```

Para o modal, `GET /negociacoes/:id` deve incluir `tentativasLigacao` e `interacoes`.

## Segurança frontend

O frontend melhora a experiência e reduz exposições acidentais, mas não substitui as garantias do backend. Toda autorização precisa continuar sendo validada na API.

Para uma versão de produção ainda mais segura, recomenda-se trocar o JWT acessível pelo JavaScript por cookie `HttpOnly`, `Secure` e `SameSite`, usando access token curto e proteção CSRF quando aplicável. Isso reduz o impacto de roubo de token por XSS.
