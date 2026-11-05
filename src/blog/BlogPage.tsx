import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Search, RefreshCw, X } from 'lucide-react';
import { BlogShell } from './BlogShell';
import { apiRequest } from './api';
import { categories, type BlogCategory, type BlogPost } from './types';
import { EditorialImage } from '../components/EditorialImage';

function categoryLabel(category: BlogCategory) {
  return categories.find(item => item.id === category)?.label || 'Publicações';
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

function formatDate(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(date);
}

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));
}

function imagePath(value: string) {
  return /^\/(?:uploads\/blog|images)\/[a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp)$/.test(value) ? value : '';
}

export function ArticleBody({ content }: { content: string }) {
  return <div className="blog-article-body">{content.trim().split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

function PostCard({ post }: { post: BlogPost }) {
  const cover = imagePath(post.image);
  const date = formatDate(post.publishedAt);
  return <a href={`/blog/?artigo=${encodeURIComponent(post.slug)}`} className="blog-post-card">
    <div className="blog-post-image">{cover ? <img src={cover} alt={post.imageAlt} width="1200" height="800" loading="lazy" decoding="async" /> : <div className="blog-post-image-empty" aria-hidden="true"><BookOpen size={38} strokeWidth={1} /></div>}<span className="blog-post-arrow" aria-hidden="true"><ArrowUpRight size={21} /></span></div>
    <div className="blog-post-copy"><span className="blog-kicker">{categoryLabel(post.category)}</span><h2>{post.title}</h2><p>{post.excerpt}</p><div className="blog-post-meta">{date && <time dateTime={post.publishedAt!}>{date}</time>}<span>{readingTime(post.content)} min de leitura</span></div><span className="blog-read-link">Ler artigo<ArrowRight size={16} /></span></div>
  </a>;
}

function LoadError({ article, onRetry }: { article: boolean; onRetry: () => void }) {
  const Heading = article ? 'h1' : 'h2';
  return <div className="blog-state blog-state-error" role="alert"><RefreshCw size={32} strokeWidth={1.2} aria-hidden="true" /><Heading>{article ? 'Não foi possível abrir esta publicação.' : 'As publicações não estão disponíveis agora.'}</Heading><p>{article ? 'O endereço pode ter sido alterado ou a publicação pode estar indisponível. Você pode tentar novamente ou voltar ao blog.' : 'Não conseguimos acessar as publicações nesta versão. Tente novamente em instantes.'}</p><div className="blog-state-actions"><button className="blog-button" onClick={onRetry}>Tentar novamente<RefreshCw size={16} /></button>{article && <a className="blog-text-link" href="/blog/">Voltar ao blog<ArrowRight size={16} /></a>}</div></div>;
}

function Loading({ article = false }: { article?: boolean }) {
  return <div className="blog-loading" role="status" aria-live="polite"><span className="blog-loading-line" aria-hidden="true" />{article ? 'Carregando a publicação…' : 'Carregando as publicações…'}</div>;
}

export default function BlogPage() {
  const slug = new URLSearchParams(window.location.search).get('artigo') || '';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [category, setCategory] = useState<BlogCategory | 'todas'>('todas');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(9);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false);
    if (slug) {
      apiRequest<{ post: BlogPost }>(`post&slug=${encodeURIComponent(slug)}`, { signal: controller.signal }).then(result => { if (!controller.signal.aborted) setPost(result.post); }).catch(() => { if (!controller.signal.aborted) setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    } else {
      apiRequest<{ posts: BlogPost[] }>('posts', { signal: controller.signal }).then(result => { if (!controller.signal.aborted) setPosts(result.posts.filter(item => item.status === 'published').sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))); }).catch(() => { if (!controller.signal.aborted) setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }
    return () => controller.abort();
  }, [slug, revision]);

  useEffect(() => {
    const originalTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const originalDescription = description?.content;
    document.title = post && slug ? `${post.title} | RTM Advocacia` : 'Blog | RTM Advocacia';
    if (description) description.content = post && slug ? post.excerpt : 'Publicações da RTM Advocacia sobre Direito Civil, Direito do Consumidor e Direito Médico.';
    return () => { document.title = originalTitle; if (description && originalDescription) description.content = originalDescription; };
  }, [post, slug]);

  useEffect(() => setVisible(9), [category, query]);

  const filteredPosts = useMemo(() => {
    const search = normalize(query.trim());
    return posts.filter(item => (category === 'todas' || item.category === category) && (!search || normalize(`${item.title} ${item.excerpt} ${item.content} ${categoryLabel(item.category)}`).includes(search)));
  }, [posts, category, query]);

  if (slug) return <BlogShell><div className="blog-width blog-article-container"><nav className="blog-breadcrumb" aria-label="Você está em"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/blog/">Blog</a><span aria-hidden="true">/</span><span>Publicação</span></nav><a className="blog-text-link blog-back-link" href="/blog/"><ArrowLeft size={17} />Todas as publicações</a><div aria-busy={loading}>{loading ? <Loading article /> : error || !post ? <LoadError article onRetry={() => setRevision(value => value + 1)} /> : <article className="blog-article"><header className="blog-article-heading"><span className="blog-kicker">{categoryLabel(post.category)}</span><h1>{post.title}</h1><p className="blog-article-excerpt">{post.excerpt}</p><div className="blog-article-meta"><span>{post.author || 'RTM Advocacia'}</span>{formatDate(post.publishedAt) && <time dateTime={post.publishedAt!}>{formatDate(post.publishedAt)}</time>}<span>{readingTime(post.content)} min de leitura</span></div></header>{imagePath(post.image) && <figure className="blog-article-cover"><img src={post.image} alt={post.imageAlt} width="1200" height="800" decoding="async" fetchPriority="high" /></figure>}<ArticleBody content={post.content} /><aside className="blog-article-note">Este conteúdo é informativo. A orientação jurídica depende da análise das circunstâncias de cada caso.</aside><div className="blog-article-end"><a href="/blog/" className="blog-text-link"><ArrowLeft size={17} />Voltar às publicações</a><a href="/#contato" className="blog-text-link">Fale com o escritório<ArrowUpRight size={17} /></a></div></article>}</div></div></BlogShell>;

  return <BlogShell>
    <section className="blog-intro" aria-labelledby="blog-title"><div className="blog-intro-image" aria-hidden="true"><EditorialImage image="law-library-editorial" priority decorative sizes="100vw" /></div><div className="blog-width blog-intro-copy"><nav className="blog-breadcrumb blog-breadcrumb-light" aria-label="Você está em"><a href="/">Início</a><span aria-hidden="true">/</span><span>Blog</span></nav><span className="blog-kicker">PUBLICAÇÕES · RTM ADVOCACIA</span><h1 id="blog-title">Direito em<br /><em>perspectiva.</em></h1><p>Informação jurídica com clareza, contexto<br className="blog-desktop-break" /> e atenção ao que importa para você.</p></div></section>
    <section className="blog-width blog-publications" aria-labelledby="blog-publications-title"><div className="blog-publications-heading"><div><span className="blog-kicker">CONHECIMENTO PARA INFORMAR</span><h2 id="blog-publications-title">Explore as publicações.</h2></div><div className="blog-search"><label htmlFor="blog-search">Encontre um assunto</label><div><Search size={18} aria-hidden="true" /><input id="blog-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Busque por um tema ou palavra-chave" autoComplete="off" /></div></div></div>
      <div className="blog-filters" role="group" aria-label="Filtrar publicações por área"><button type="button" onClick={() => setCategory('todas')} aria-pressed={category === 'todas'}>Todas as áreas</button>{categories.map(item => <button type="button" key={item.id} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}>{item.label}</button>)}</div>
      <div className="blog-list-content" aria-busy={loading}>{loading ? <Loading /> : error ? <LoadError article={false} onRetry={() => setRevision(value => value + 1)} /> : posts.length === 0 ? <div className="blog-state"><BookOpen size={42} strokeWidth={1.1} aria-hidden="true" /><span className="blog-kicker">EM BREVE</span><h2>As próximas publicações<br />estarão aqui.</h2><p>Estamos preparando conteúdos sobre as áreas de atuação da RTM Advocacia. Enquanto isso, conheça o escritório e os serviços jurídicos.</p><a href="/#atuacao" className="blog-text-link">Conheça nossas áreas<ArrowUpRight size={17} /></a></div> : <><p className="blog-results" role="status" aria-live="polite">{filteredPosts.length} {filteredPosts.length === 1 ? 'publicação encontrada' : 'publicações encontradas'}{query.trim() && <> para “{query.trim()}”</>}</p>{filteredPosts.length ? <><div className="blog-post-grid">{filteredPosts.slice(0, visible).map(item => <PostCard post={item} key={item.id} />)}</div>{filteredPosts.length > visible && <div className="blog-load-more"><button type="button" className="blog-button blog-button-outline" onClick={() => setVisible(value => value + 9)}>Ver mais publicações<ArrowRight size={17} /></button></div>}</> : <div className="blog-state blog-no-results"><Search size={34} strokeWidth={1.1} aria-hidden="true" /><h2>Nenhuma publicação encontrada.</h2><p>Experimente outro termo ou explore todas as áreas.</p><button type="button" className="blog-text-link" onClick={() => { setCategory('todas'); setQuery(''); }}>Limpar busca e filtros<X size={16} /></button></div>}</>}</div>
    </section>
  </BlogShell>;
}
