import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, KeyRound, ShieldCheck, UserPlus, UserX } from 'lucide-react';
import { Modal } from '../components/Modal';
import { apiRequest, ApiError } from './api';
import type { BlogSession } from './types';

type AuthorizedUser = {
  id: string;
  username: string;
  role: 'admin' | 'editor';
  createdAt: string;
};

type Props = {
  session: BlogSession;
  disabled?: boolean;
  onSessionChange: (session: BlogSession) => void;
  onError: (error: unknown) => Promise<void>;
};

export function AuthorizedAccess({ session, disabled = false, onSessionChange, onError }: Props) {
  const [mode, setMode] = useState<'users' | 'password' | null>(null);
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const requestVersion = useRef(0);

  function clearFields() {
    setUsername(''); setNewPassword(''); setConfirmation(''); setCurrentPassword('');
    setError(''); setSuccess(''); setRevokingId(null);
  }

  function open(nextMode: 'users' | 'password') {
    clearFields(); setMode(nextMode);
  }

  function close() {
    if (working) return;
    requestVersion.current++;
    setMode(null); clearFields();
  }

  async function report(cause: unknown) {
    setError(cause instanceof Error ? cause.message : 'Não foi possível concluir esta ação.');
    setSuccess('');
    if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) await onError(cause);
  }

  useEffect(() => {
    if (!session.authenticated || (mode === 'users' && session.role !== 'admin')) {
      setMode(null); clearFields();
    }
  }, [session.authenticated, session.role]);

  useEffect(() => {
    if (mode !== 'users' || session.role !== 'admin') return;
    const version = ++requestVersion.current;
    const controller = new AbortController();
    setLoading(true);
    apiRequest<{ users: AuthorizedUser[] }>('users', { signal: controller.signal }).then(result => {
      if (requestVersion.current === version) setUsers(result.users);
    }).catch(cause => { if (!controller.signal.aborted && requestVersion.current === version) void report(cause); })
      .finally(() => { if (requestVersion.current === version) setLoading(false); });
    return () => controller.abort();
  }, [mode, session.role]);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    if (working || session.role !== 'admin') return;
    setError(''); setSuccess('');
    if (newPassword.length < 12) { setError('A senha precisa ter pelo menos 12 caracteres.'); return; }
    if (newPassword !== confirmation) { setError('A confirmação da senha precisa ser igual à senha escolhida.'); return; }
    setWorking(true);
    try {
      const result = await apiRequest<{ user: AuthorizedUser }>('create-user', {
        method: 'POST', csrfToken: session.csrfToken, body: { username: username.trim(), password: newPassword },
      });
      setUsers(previous => [...previous, result.user]);
      setUsername(''); setNewPassword(''); setConfirmation('');
      setSuccess('Acesso de editor criado. Entregue o usuário e a senha somente à pessoa autorizada.');
    } catch (cause) { await report(cause); }
    finally { setWorking(false); }
  }

  async function revokeUser(user: AuthorizedUser) {
    if (working || session.role !== 'admin' || user.role === 'admin') return;
    setWorking(true); setError(''); setSuccess('');
    try {
      await apiRequest<{ ok: boolean }>('revoke-user', { method: 'POST', csrfToken: session.csrfToken, body: { id: user.id } });
      setUsers(previous => previous.filter(item => item.id !== user.id));
      setRevokingId(null);
      setSuccess(`O acesso de ${user.username} foi revogado.`);
    } catch (cause) { await report(cause); }
    finally { setWorking(false); }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (working) return;
    setError(''); setSuccess('');
    if (newPassword.length < 12) { setError('A nova senha precisa ter pelo menos 12 caracteres.'); return; }
    if (newPassword !== confirmation) { setError('A confirmação da nova senha precisa ser igual à senha escolhida.'); return; }
    setWorking(true);
    try {
      const nextSession = await apiRequest<BlogSession>('change-password', {
        method: 'POST', csrfToken: session.csrfToken, body: { currentPassword, newPassword },
      });
      onSessionChange(nextSession);
      setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      setSuccess('Senha alterada. Use a nova senha no próximo acesso.');
    } catch (cause) { await report(cause); }
    finally { setWorking(false); }
  }

  return <>
    <div className="blog-admin-access-actions">
      {session.role === 'admin' && <button type="button" className="blog-admin-quiet" disabled={disabled} onClick={() => open('users')}><ShieldCheck size={16} aria-hidden="true" />Gerenciar acessos</button>}
      <button type="button" className="blog-admin-quiet" disabled={disabled} onClick={() => open('password')}><KeyRound size={16} aria-hidden="true" />Alterar minha senha</button>
    </div>
    {mode && <Modal title={mode === 'users' ? 'Acessos autorizados' : 'Alterar minha senha'} onClose={close}>
      <div className="blog-admin-access-panel">
        {mode === 'users' ? <>
          <p>Somente o administrador principal pode liberar ou revogar acessos. Os editores autorizados podem administrar as publicações.</p>
          <section aria-labelledby="access-list-title"><h3 id="access-list-title">Quem pode acessar</h3>
            {loading ? <p role="status">Carregando os acessos…</p> : <ul className="blog-admin-users-list">{users.map(user => <li key={user.id}>
              <div><strong>{user.username}</strong><span>{user.role === 'admin' ? 'Administrador principal' : 'Editor autorizado'}</span></div>
              {user.role !== 'admin' && <div className="blog-admin-user-revoke">{revokingId === user.id ? <>
                <p>Este usuário perderá o acesso ao painel. As publicações serão mantidas.</p>
                <div><button type="button" className="blog-admin-outline" onClick={() => setRevokingId(null)} disabled={working}>Cancelar revogação</button><button type="button" className="blog-admin-delete" onClick={() => void revokeUser(user)} disabled={working}>Confirmar revogação</button></div>
              </> : <button type="button" className="blog-admin-delete" aria-label={`Revogar acesso de ${user.username}`} onClick={() => setRevokingId(user.id)} disabled={working}><UserX size={15} aria-hidden="true" />Revogar acesso</button>}</div>}
            </li>)}</ul>}
          </section>
          <form onSubmit={createUser}><h3>Liberar um novo editor</h3><p className="blog-admin-field-help">Crie o acesso somente para uma pessoa autorizada pelo escritório.</p>
            <label className="blog-admin-field">Usuário do novo acesso<input aria-label="Usuário do novo acesso" name="newUsername" autoComplete="off" value={username} onChange={event => setUsername(event.target.value)} minLength={3} maxLength={64} pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}" required disabled={working} aria-describedby="new-user-help" /></label>
            <p id="new-user-help" className="blog-admin-field-help">Use letras sem acento, números, ponto, hífen ou sublinhado. Mínimo de 3 caracteres.</p>
            <label className="blog-admin-field">Senha do novo acesso<input aria-label="Senha do novo acesso" name="newUserPassword" type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} minLength={12} required disabled={working} aria-describedby="new-password-help" /></label>
            <p id="new-password-help" className="blog-admin-field-help">Escolha uma senha com pelo menos 12 caracteres.</p>
            <label className="blog-admin-field">Confirmar senha do novo acesso<input aria-label="Confirmar senha do novo acesso" name="newUserPasswordConfirmation" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} minLength={12} required disabled={working} /></label>
            <button className="blog-admin-button" type="submit" disabled={working}><UserPlus size={16} aria-hidden="true" />{working ? 'Aguarde…' : 'Criar acesso de editor'}</button>
          </form>
        </> : <form onSubmit={changePassword}>
          <p>Altere a senha do seu próprio acesso. As demais sessões desse usuário precisarão entrar novamente.</p>
          <label className="blog-admin-field">Senha atual<input aria-label="Senha atual" name="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required disabled={working} /></label>
          <label className="blog-admin-field">Nova senha<input aria-label="Nova senha" name="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} minLength={12} required disabled={working} aria-describedby="change-password-help" /></label>
          <p id="change-password-help" className="blog-admin-field-help">Use pelo menos 12 caracteres.</p>
          <label className="blog-admin-field">Confirmar nova senha<input aria-label="Confirmar nova senha" name="newPasswordConfirmation" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} minLength={12} required disabled={working} /></label>
          <button type="submit" className="blog-admin-button" disabled={working}><KeyRound size={16} aria-hidden="true" />{working ? 'Salvando…' : 'Salvar nova senha'}</button>
        </form>}
        <div className="blog-admin-messages" aria-live="polite" aria-atomic="true">{error && <p className="blog-admin-error" role="alert">{error}</p>}{success && <p className="blog-admin-success" role="status"><Check size={17} aria-hidden="true" />{success}</p>}</div>
      </div>
    </Modal>}
  </>;
}
