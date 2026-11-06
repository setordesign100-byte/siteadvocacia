import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Eye, FileText, ImagePlus, LogOut, Plus, Save, Send, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { apiRequest, ApiError } from './api';
import { BlogShell } from './BlogShell';
import { AuthorizedAccess } from './AuthorizedAccess';
import { categories, type BlogCategory, type BlogPost, type BlogSession } from './types';

type Editor = {
  id?: string;
  updatedAt?: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  image: string;
  imageAlt: string;
  author: string;
  status: 'draft' | 'published';
};
type Confirmation = { title: string; text: string; action: string; confirm: () => void };
type Work = 'save' | 'publish' | 'upload' | 'logout' | 'delete' | null;
const emptyEditor = (): Editor => ({ title: '', excerpt: '', content: '', category: 'civil', image: '', imageAlt: '', author: 'RTM Advocacia', status: 'draft' });
const editorFrom = (post: BlogPost): Editor => ({ id: post.id, updatedAt: post.updatedAt, title: post.title, excerpt: post.excerpt, content: post.content, category: post.category, image: post.image, imageAlt: post.imageAlt, author: post.author, status: post.status });
const serialize = (editor: Editor) => JSON.stringify(editor);
const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));

export default function BlogAdmin() {
  const [session, setSession] = useState<BlogSession | null>(null);
  const [bootError, setBootError] = useState('');
  const [booting, setBooting] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [listingBusy, setListingBusy] = useState(false);
  const [editor, setEditor] = useState<Editor>(emptyEditor);
  const [saved, setSaved] = useState(() => serialize(emptyEditor()));
  const [preview, setPreview] = useState(false);
  const [work, setWork] = useState<Work>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const dirty = serialize(editor) !== saved;
  const busy = work !== null;

  useEffect(() => {
    const previous = document.title;
    document.title = 'Painel de publicações | RTM Advocacia';
    return () => { document.title = previous; };
  }, []);

  async function boot() {
    setBooting(true);
    setBootError('');
    try { setSession(await apiRequest<BlogSession>('session')); }
    catch (cause) { setBootError(cause instanceof ApiError ? cause.message : 'O painel precisa estar na hospedagem com PHP para acessar suas publicações. Envie o pacote completo do site para a hospedagem e abra este endereço pelo seu domínio.'); }
    finally { setBooting(false); }
  }

  useEffect(() => { void boot(); }, []);

  useEffect(() => {
    if (!session?.authenticated) return;
    let active = true;
    setListingBusy(true);
    apiRequest<{ posts: BlogPost[] }>('manage').then(result => {
      if (active) setPosts(result.posts);
    }).catch(cause => { if (active) void reportError(cause); }).finally(() => { if (active) setListingBusy(false); });
    return () => { active = false; };
  }, [session?.authenticated]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => () => { if (uploadPreview) URL.revokeObjectURL(uploadPreview); }, [uploadPreview]);

  async function reportError(cause: unknown, authenticationAttempt = false) {
    setSuccess('');
    setError(cause instanceof Error ? cause.message : 'Não foi possível concluir. Tente novamente.');
    if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
      try {
        const refreshed = await apiRequest<BlogSession>('session');
        setSession(refreshed);
        if (!authenticationAttempt) setError(refreshed.authenticated ? 'Sua sessão foi atualizada. Tente a ação novamente; suas alterações continuam nesta tela.' : 'Sua sessão terminou. Entre novamente para continuar; seu texto foi mantido nesta tela.');
      } catch { setSession(previous => previous ? { ...previous, authenticated: false } : previous); }
    }
  }

  async function authenticate(event: FormEvent) {
    event.preventDefault();
    if (!session || authBusy) return;
    setError(''); setSuccess('');
    setAuthBusy(true);
    try {
      const next = await apiRequest<BlogSession>('login', {
        method: 'POST', csrfToken: session.csrfToken,
        body: { username: username.trim(), password },
      });
      setSession(next); setPassword('');
      setSuccess('Você entrou no painel.');
    } catch (cause) { await reportError(cause, true); }
    finally { setAuthBusy(false); }
  }

  function update<K extends keyof Editor>(key: K, value: Editor[K]) {
    setEditor(previous => ({ ...previous, [key]: value }));
    setFieldErrors(previous => { const next = { ...previous }; delete next[key]; return next; });
    setSuccess('');
  }

  function openEditor(post?: BlogPost) {
    const next = post ? editorFrom(post) : emptyEditor();
    setEditor(next); setSaved(serialize(next)); setPreview(false); setError(''); setSuccess(''); setFieldErrors({});
    if (fileInput.current) fileInput.current.value = '';
    requestAnimationFrame(() => { editorHeading.current?.focus(); });
  }

  function confirmUnsaved(action: () => void) {
    if (!dirty) { action(); return; }
    setConfirmation({ title: 'Continuar sem salvar?', text: 'Há alterações neste artigo que ainda não foram salvas. Você pode voltar e salvar um rascunho antes de continuar.', action: 'Continuar sem salvar', confirm: action });
  }

  async function upload(file?: File) {
    if (!file || !session || busy) return;
    setError(''); setSuccess('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Escolha uma imagem JPG, PNG ou WebP.'); if (fileInput.current) fileInput.current.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { setError('A imagem precisa ter até 5 MB. Escolha uma versão menor.'); if (fileInput.current) fileInput.current.value = ''; return; }
    const localPreview = URL.createObjectURL(file);
    setUploadPreview(localPreview); setWork('upload');
    const body = new FormData(); body.append('file', file);
    try {
      const result = await apiRequest<{ image: string }>('upload', { method: 'POST', csrfToken: session.csrfToken, body });
      update('image', result.image);
      setSuccess('Imagem escolhida. Salve o rascunho ou publique para incluí-la no artigo.');
    } catch (cause) { await reportError(cause); }
    finally { setUploadPreview(''); setWork(null); if (fileInput.current) fileInput.current.value = ''; }
  }

  function validate(status: 'draft' | 'published') {
    const issues: Record<string, string> = {};
    if (editor.title.trim().length < (status === 'published' ? 6 : 3)) issues.title = status === 'published' ? 'Escreva um título com pelo menos 6 caracteres.' : 'Dê um título ao rascunho, com pelo menos 3 caracteres.';
    if (status === 'published') {
      if (editor.excerpt.trim().length < 10) issues.excerpt = 'Escreva um resumo curto, com pelo menos 10 caracteres.';
      if (!editor.image) issues.image = 'Escolha a imagem de capa do artigo.';
      if (editor.imageAlt.trim().length < 3) issues.imageAlt = 'Descreva a imagem em poucas palavras.';
      if (editor.content.trim().length < 30) issues.content = 'Inclua o texto do artigo, com pelo menos 30 caracteres.';
    }
    setFieldErrors(issues);
    if (Object.keys(issues).length) {
      setPreview(false); setError('Confira os campos indicados antes de continuar.');
      requestAnimationFrame(() => document.getElementById(`post-${Object.keys(issues)[0]}`)?.focus());
      return false;
    }
    return true;
  }

  async function savePost(status: 'draft' | 'published') {
    if (!session || busy || !validate(status)) return;
    setError(''); setSuccess(''); setWork(status === 'published' ? 'publish' : 'save');
    try {
      const { post } = await apiRequest<{ post: BlogPost }>('save', { method: 'POST', csrfToken: session.csrfToken, body: { ...editor, status } });
      const next = editorFrom(post);
      setEditor(next); setSaved(serialize(next));
      setPosts(previous => [post, ...previous.filter(item => item.id !== post.id)]);
      setSuccess(status === 'published' ? 'Artigo publicado. Ele já está disponível no blog.' : 'Rascunho salvo. Você pode continuar depois.');
    } catch (cause) { await reportError(cause); }
    finally { setWork(null); }
  }

  function draftPost() {
    if (editor.status !== 'published') { void savePost('draft'); return; }
    setConfirmation({ title: 'Retirar publicação do blog?', text: 'O artigo ficará salvo como rascunho e poderá ser publicado novamente quando você quiser.', action: 'Retirar do blog', confirm: () => { void savePost('draft'); } });
  }

  function deletePost() {
    if (!editor.id || busy || !session) return;
    const current = editor;
    setConfirmation({ title: 'Excluir este artigo?', text: 'O artigo será excluído do painel e deixará de aparecer no blog. Essa ação não pode ser desfeita.', action: 'Confirmar exclusão', confirm: () => {
      setWork('delete'); setError(''); setSuccess('');
      apiRequest<{ ok: boolean }>('delete', { method: 'POST', csrfToken: session.csrfToken, body: { id: current.id, updatedAt: current.updatedAt } }).then(() => {
        setPosts(previous => previous.filter(post => post.id !== current.id)); openEditor(); setSuccess('Artigo excluído.');
      }).catch(cause => { void reportError(cause); }).finally(() => setWork(null));
    } });
  }

  async function logout() {
    if (!session || busy) return;
    setWork('logout'); setError(''); setSuccess('');
    try {
      setSession(await apiRequest<BlogSession>('logout', { method: 'POST', csrfToken: session.csrfToken, body: {} }));
      const next = emptyEditor(); setEditor(next); setSaved(serialize(next)); setPosts([]);
    } catch (cause) { await reportError(cause); }
    finally { setWork(null); }
  }

  const messages = <div className="blog-admin-messages" aria-live="polite" aria-atomic="true">{error && <p className="blog-admin-error" role="alert">{error}</p>}{success && <p className="blog-admin-success" role="status"><Check size={17} aria-hidden="true" />{success}</p>}</div>;

  if (booting || bootError) return <BlogShell admin><div className="blog-admin-auth blog-admin-wrap"><span className="blog-admin-eyebrow">ÁREA DE PUBLICAÇÃO</span><h1>Seu espaço para<br /><em>compartilhar conhecimento.</em></h1>{booting ? <p role="status">Preparando o painel…</p> : <><p className="blog-admin-explanation">{bootError}</p><button className="blog-admin-button" onClick={() => void boot()}>Tentar novamente</button></>}</div></BlogShell>;

  if (!session?.authenticated) return <BlogShell admin>
    <div className="blog-admin-auth blog-admin-wrap">
      <div className="blog-admin-auth-intro">
        <span className="blog-admin-eyebrow">ACESSO RESTRITO · RTM ADVOCACIA</span>
        <h1>Seu espaço para<br /><em>publicar com cuidado.</em></h1>
        <p>Esta área é reservada à equipe autorizada. Entre com o usuário e a senha fornecidos pelo responsável do escritório.</p>
        <ol className="blog-admin-intro-steps"><li><span>01</span>Prepare sua publicação.</li><li><span>02</span>Revise a imagem e o texto.</li><li><span>03</span>Publique com seu acesso autorizado.</li></ol>
      </div>
      <div className="blog-admin-auth-card">
        <span className="blog-admin-eyebrow">SOMENTE PESSOAS AUTORIZADAS</span>
        <h2>Entre no painel.</h2>
        {!session?.setupConfigured ? <p className="blog-admin-explanation">A conta principal precisa ser incluída no pacote do site. Envie o ZIP atualizado fornecido ao responsável do escritório.</p> : <form onSubmit={authenticate}>
          <p className="blog-admin-field-help">Use seu acesso principal ou o acesso de editor liberado pelo administrador.</p>
          <label className="blog-admin-field">Usuário<input name="username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} minLength={3} maxLength={64} required disabled={authBusy} /></label>
          <label className="blog-admin-field">Senha<input name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required disabled={authBusy} /></label>
          {messages}
          <button className="blog-admin-button blog-admin-auth-submit" type="submit" disabled={authBusy}>{authBusy ? 'Aguarde…' : 'Entrar no painel'}<ArrowUpRight size={18} aria-hidden="true" /></button>
        </form>}
      </div>
    </div>
  </BlogShell>;

  return <BlogShell admin><div className="blog-admin-wrap blog-admin-dashboard"><div className="blog-admin-top"><div><span className="blog-admin-eyebrow">PAINEL DE PUBLICAÇÕES</span><h1>Seu próximo artigo<br /><em>começa aqui.</em></h1><p>Olá, {session.username || 'equipe RTM'}. Escreva no seu ritmo e publique quando estiver pronto.</p></div><div className="blog-admin-account-actions"><span className="blog-admin-account-role">{session.role === 'admin' ? 'Administrador principal' : 'Editor autorizado'}</span><AuthorizedAccess session={session} disabled={busy} onSessionChange={next => { setSession(next); if (next.username) setUsername(next.username); }} onError={reportError} /><button className="blog-admin-quiet" onClick={() => confirmUnsaved(() => void logout())} disabled={busy}><LogOut size={16} aria-hidden="true" />Sair</button></div></div><div className="blog-admin-layout"><aside className="blog-admin-library" aria-label="Suas publicações"><div className="blog-admin-library-heading"><h2>Seus artigos</h2><span>{posts.length}</span></div><button className="blog-admin-button blog-admin-new" onClick={() => confirmUnsaved(() => openEditor())} disabled={busy}><Plus size={18} aria-hidden="true" />Novo artigo</button>{listingBusy ? <p className="blog-admin-field-help" role="status">Carregando seus artigos…</p> : posts.length === 0 ? <div className="blog-admin-library-empty"><FileText size={26} aria-hidden="true" /><p>Seu primeiro artigo começa ao lado.</p><span>Os rascunhos ficam guardados aqui para você continuar depois.</span></div> : <ul className="blog-admin-post-list">{posts.map(post => <li key={post.id}><button className="blog-admin-post-item" aria-label={`Editar ${post.title}`} aria-current={editor.id === post.id ? 'true' : undefined} onClick={() => confirmUnsaved(() => openEditor(post))} disabled={busy}><span className={`blog-admin-badge ${post.status === 'published' ? 'is-published' : ''}`}>{post.status === 'published' ? 'Publicado' : 'Rascunho'}</span><strong>{post.title}</strong><time dateTime={post.updatedAt}>Atualizado em {formatDate(post.updatedAt)}</time></button></li>)}</ul>}<a className="blog-admin-library-link" href="/blog/" target="_blank" rel="noopener noreferrer">Abrir o blog<ArrowUpRight size={15} aria-hidden="true" /></a></aside><section className="blog-admin-workspace" aria-labelledby="editor-heading"><div className="blog-admin-editor-heading"><div><span className={`blog-admin-badge ${editor.status === 'published' ? 'is-published' : ''}`}>{editor.status === 'published' ? 'PUBLICADO' : editor.id ? 'RASCUNHO' : 'NOVO ARTIGO'}</span><h2 id="editor-heading" ref={editorHeading} tabIndex={-1}>{editor.id ? 'Continue sua publicação.' : 'Vamos criar uma publicação.'}</h2><p>{dirty ? 'Há alterações ainda não salvas.' : editor.id ? 'Todas as alterações foram salvas.' : 'Preencha as etapas abaixo para preparar seu artigo.'}</p></div><button className="blog-admin-outline" onClick={() => setPreview(value => !value)} disabled={busy}><Eye size={16} aria-hidden="true" />{preview ? 'Continuar editando' : 'Ver prévia'}</button></div>{messages}{preview ? <article className="blog-admin-preview" aria-label="Prévia do artigo"><div className="blog-admin-preview-notice">PRÉVIA · confira como o seu conteúdo será apresentado</div>{editor.image ? <img className="blog-admin-preview-image" src={editor.image} alt={editor.imageAlt || 'Imagem de capa do artigo em preparação'} /> : <div className="blog-admin-preview-empty"><ImagePlus size={28} aria-hidden="true" /><span>Sua imagem de capa aparecerá aqui.</span></div>}<div className="blog-admin-preview-copy"><span className="blog-admin-eyebrow">{categories.find(category => category.id === editor.category)?.label}</span><h3>{editor.title || 'O título do seu artigo'}</h3>{editor.excerpt && <p className="blog-admin-preview-excerpt">{editor.excerpt}</p>}<span className="blog-admin-preview-author">{editor.author || 'RTM Advocacia'}</span><div className="blog-admin-preview-body">{editor.content.trim() ? editor.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>O texto que você escrever aparecerá neste espaço.</p>}</div></div></article> : <form id="blog-post-form" className="blog-admin-editor-form" noValidate onSubmit={event => { event.preventDefault(); void savePost('published'); }}><fieldset disabled={busy}><legend><span>01</span>Apresente o assunto</legend><p className="blog-admin-step-help">Um título claro e um breve resumo ajudam o leitor a encontrar o conteúdo.</p><label className="blog-admin-field">Título do artigo<input id="post-title" name="title" aria-label="Título do artigo" value={editor.title} onChange={event => update('title', event.target.value)} maxLength={180} aria-invalid={!!fieldErrors.title} aria-describedby={fieldErrors.title ? 'error-title' : undefined} placeholder="Sobre o que você vai escrever?" />{fieldErrors.title && <span id="error-title" className="blog-admin-field-error">{fieldErrors.title}</span>}</label><div className="blog-admin-field-row"><label className="blog-admin-field">Categoria<select id="post-category" aria-label="Categoria" value={editor.category} onChange={event => update('category', event.target.value as BlogCategory)}>{categories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label><label className="blog-admin-field">Autoria<input id="post-author" aria-label="Autoria" value={editor.author} onChange={event => update('author', event.target.value)} maxLength={120} /></label></div><label className="blog-admin-field">Resumo<textarea id="post-excerpt" name="excerpt" aria-label="Resumo" value={editor.excerpt} onChange={event => update('excerpt', event.target.value)} maxLength={320} rows={3} aria-invalid={!!fieldErrors.excerpt} aria-describedby={fieldErrors.excerpt ? 'error-excerpt' : 'help-excerpt'} placeholder="Apresente a ideia principal em uma ou duas frases." /><span id="help-excerpt" className="blog-admin-field-help">Esse texto aparece nos cartões do blog. {editor.excerpt.length}/320 caracteres.</span>{fieldErrors.excerpt && <span id="error-excerpt" className="blog-admin-field-error">{fieldErrors.excerpt}</span>}</label></fieldset><fieldset disabled={busy}><legend><span>02</span>Escolha a imagem de capa</legend><p className="blog-admin-step-help">Prefira uma fotografia horizontal relacionada ao assunto do artigo.</p><div className={`blog-admin-image-picker ${editor.image || uploadPreview ? 'has-image' : ''}`}>{editor.image || uploadPreview ? <img src={uploadPreview || editor.image} alt={editor.imageAlt || 'Imagem selecionada para a capa do artigo'} /> : <div className="blog-admin-image-placeholder"><ImagePlus size={30} aria-hidden="true" /><span>Adicione uma imagem ao seu artigo.</span></div>}<label className="blog-admin-upload-label" htmlFor="post-image"><ImagePlus size={17} aria-hidden="true" />{work === 'upload' ? 'Enviando imagem…' : editor.image ? 'Trocar imagem' : 'Selecionar imagem'}</label><input id="post-image" ref={fileInput} type="file" aria-label="Escolher imagem" accept="image/jpeg,image/png,image/webp" onChange={event => void upload(event.target.files?.[0])} aria-invalid={!!fieldErrors.image} aria-describedby={fieldErrors.image ? 'help-image error-image' : 'help-image'} /></div><p id="help-image" className="blog-admin-field-help">JPG, PNG ou WebP, com até 5 MB. A imagem entra no artigo quando você salvar ou publicar.</p>{fieldErrors.image && <p id="error-image" className="blog-admin-field-error">{fieldErrors.image}</p>}<label className="blog-admin-field">Descrição da imagem<input id="post-imageAlt" name="imageAlt" aria-label="Descrição da imagem" value={editor.imageAlt} onChange={event => update('imageAlt', event.target.value)} maxLength={240} aria-invalid={!!fieldErrors.imageAlt} aria-describedby={fieldErrors.imageAlt ? 'error-imageAlt' : 'help-imageAlt'} placeholder="Ex.: documentos e chaves sobre uma mesa" /><span id="help-imageAlt" className="blog-admin-field-help">Descreva o que aparece na imagem para quem usa leitor de tela.</span>{fieldErrors.imageAlt && <span id="error-imageAlt" className="blog-admin-field-error">{fieldErrors.imageAlt}</span>}</label></fieldset><fieldset disabled={busy}><legend><span>03</span>Escreva seu conteúdo</legend><p className="blog-admin-step-help">Organize suas ideias em parágrafos curtos. Separe cada parágrafo com uma linha em branco.</p><label className="blog-admin-field">Texto do artigo<textarea id="post-content" name="content" aria-label="Texto do artigo" className="blog-admin-content-input" value={editor.content} onChange={event => update('content', event.target.value)} maxLength={50000} rows={15} aria-invalid={!!fieldErrors.content} aria-describedby={fieldErrors.content ? 'error-content' : 'help-content'} placeholder="Comece seu artigo aqui…" /><span id="help-content" className="blog-admin-field-help">{editor.content.length.toLocaleString('pt-BR')} caracteres · use a prévia para revisar a leitura.</span>{fieldErrors.content && <span id="error-content" className="blog-admin-field-error">{fieldErrors.content}</span>}</label></fieldset></form>}<div className="blog-admin-publish"><div><span className="blog-admin-eyebrow">04 · REVISE E FINALIZE</span><p>Salve para continuar depois ou publique para disponibilizar o artigo no blog.</p>{editor.status === 'published' && editor.id && <a href={`/blog/?artigo=${encodeURIComponent(posts.find(post => post.id === editor.id)?.slug || '')}`} target="_blank" rel="noopener noreferrer">Ver publicação<ArrowUpRight size={14} aria-hidden="true" /></a>}</div><div className="blog-admin-publish-actions"><button className="blog-admin-outline" onClick={draftPost} disabled={busy}><Save size={16} aria-hidden="true" />{work === 'save' ? 'Salvando…' : editor.status === 'published' ? 'Voltar para rascunho' : 'Salvar rascunho'}</button><button className="blog-admin-button" onClick={() => void savePost('published')} disabled={busy}><Send size={16} aria-hidden="true" />{work === 'publish' ? 'Publicando…' : editor.status === 'published' ? 'Atualizar publicação' : 'Publicar artigo'}</button></div></div>{editor.id && <div className="blog-admin-delete-row"><button className="blog-admin-delete" onClick={deletePost} disabled={busy}><Trash2 size={15} aria-hidden="true" />{work === 'delete' ? 'Excluindo…' : 'Excluir artigo'}</button></div>}</section></div></div>{confirmation && <Modal title={confirmation.title} onClose={() => setConfirmation(null)}><p>{confirmation.text}</p><div className="blog-admin-confirm-actions"><button className="blog-admin-outline" onClick={() => setConfirmation(null)}>Voltar</button><button className="blog-admin-button" onClick={() => { const action = confirmation.confirm; setConfirmation(null); action(); }}>{confirmation.action}</button></div></Modal>}</BlogShell>;
}
