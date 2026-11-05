import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';

export function BlogShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  return <div className={`blog-app${admin ? ' blog-app-admin' : ''}`}>
    <a href="#blog-content" className="blog-skip">Ir para o conteúdo</a>
    <header className="blog-header">
      <div className="blog-width blog-header-inner">
        <a href="/" className="blog-brand" aria-label="RTM Advocacia — página inicial">
          <svg viewBox="0 0 72 65" width="44" height="40" fill="none" aria-hidden="true"><path d="M4 20 36 5l32 15M8 24h56M9 56h54M14 28v23M36 28v23M58 28v23M7 60h58" stroke="currentColor" strokeWidth="1.5" /><path d="m26 17 10-5 10 5" stroke="currentColor" /></svg>
          <span>RTM{' '}<small>ADVOCACIA</small></span>
        </a>
        <nav className="blog-navigation" aria-label={admin ? 'Navegação do painel' : 'Navegação do blog'}>
          {admin ? <><a href="/blog/"><ArrowLeft size={15} />Ver blog</a><a href="/">Ver site<ArrowUpRight size={16} /></a></> : <><a href="/#escritorio">O escritório</a><a href="/blog/" aria-current="page">Blog</a><a href="/#contato">Contato<ArrowUpRight size={16} /></a></>}
        </nav>
      </div>
    </header>

    <main id="blog-content" className="blog-main" tabIndex={-1}>{children}</main>

    <footer className="blog-footer">
      <div className="blog-width blog-footer-inner">
        <div><span className="blog-footer-brand">RTM Advocacia</span><p>Informação jurídica com clareza e responsabilidade.</p></div>
        <div className="blog-footer-links"><a href="/">Página inicial</a>{admin ? <a href="/blog/">Ver publicações</a> : <a href="/painel/">Área de publicação</a>}</div>
        <small>© {new Date().getFullYear()} RTM Advocacia.</small>
      </div>
    </footer>
    {!admin && <FloatingWhatsApp />}
  </div>;
}
