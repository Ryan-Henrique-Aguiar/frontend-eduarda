import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail, PhoneCall } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true)
    try { await signIn(email.trim(), senha); navigate('/') }
    catch { setError('Não foi possível entrar. Verifique o e-mail e a senha.') }
    finally { setLoading(false) }
  }

  return <main className="login-page"><section className="login-hero"><div className="brand-mark"><PhoneCall /></div><p className="eyebrow">CRM EDUARDA</p><h1>Prospecção ativa com inteligência e controle.</h1><p>Organize leads, acompanhe as ligações dos agentes e conduza oportunidades até a reunião.</p><div className="hero-pipeline"><span>Backlog</span><i /><span>Gatekeeper</span><i /><span>Decisor</span><i /><span>Finalização</span></div></section><section className="login-panel"><form className="login-card" onSubmit={submit}><div><p className="eyebrow">ACESSO AO PAINEL</p><h2>Bem-vindo de volta</h2><p>Entre com suas credenciais administrativas.</p></div>{error && <div className="alert alert--error" role="alert">{error}</div>}<label className="field"><span>E-mail</span><div className="input-with-icon"><Mail size={18} /><input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></div></label><label className="field"><span>Senha</span><div className="input-with-icon"><LockKeyhole size={18} /><input required type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} /></div></label><button className="button button--primary button--full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar no CRM'}</button><small>O acesso é protegido pelo backend com JWT, rate limit e senha criptografada.</small></form></section></main>
}
