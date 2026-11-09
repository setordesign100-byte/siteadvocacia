import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { OfficeLogo } from '../components/OfficeLogo';

export function BlogShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  return <div className={`blog-app${admin ? ' blog-app-admin' : ''}`}>
    <a href="#blog-content" className="blog-skip">Ir para o conteúdo</a>
    <header className="blog-header">
      <div className="blog-width blog-header-inner">
        <a href="/" className="blog-brand" aria-label="RTM Advocacia — página inicial">
          <OfficeLogo />
        </a>
        <nav className="blog-navigation" aria-label={admin ? 'Navegação do painel' : 'Navegação do blog'}>
          {admin ? <><a href="/blog/"><ArrowLeft size={15} />Ver blog</a><a href="/">Ver site<ArrowUpRight size={16} /></a></> : <><a href="/#escritorio">O escritório</a><a href="/blog/" aria-current="page">Blog</a><a href="/#contato">Contato<ArrowUpRight size={16} /></a></>}
        </nav>
      </div>
    </header>

    <main id="blog-content" className="blog-main" tabIndex={-1}>{children}</main>

    <footer className="blog-footer">
      <div className="blog-width blog-footer-inner">
        <div><a href="/" className="blog-brand blog-brand-light" aria-label="RTM Advocacia — página inicial"><OfficeLogo /></a><p>Informação jurídica com clareza e responsabilidade.</p></div>
        <div className="blog-footer-links"><a href="/">Página inicial</a>{admin ? <a href="/blog/">Ver publicações</a> : <a href="/painel/">Área de publicação</a>}</div>
        <small>© {new Date().getFullYear()} RTM Advocacia.</small>
      </div>
    </footer>
    {!admin && <FloatingWhatsApp />}
  </div>;
}
