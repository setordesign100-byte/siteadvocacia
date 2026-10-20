import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Minus, Menu, X, Scale, MoveUpRight, Check, ChevronRight } from 'lucide-react';
import { practiceAreas, team, editorial } from './data/content';
import { Modal } from './components/Modal';

type Panel = { kind: 'article'; index: number } | { kind: 'profile'; index: number } | { kind: 'privacy' } | null;
const navItems = [['O escritório', 'escritorio'], ['Áreas de atuação', 'atuacao'], ['Nossa equipe', 'equipe'], ['Perspectivas', 'perspectivas']];

function Brand({ footer = false }: { footer?: boolean }) {
  return <a href="#inicio" className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="RTM ADVOCACIA — início">
    <svg className="brand-symbol" viewBox="0 0 72 65" aria-hidden="true"><path d="M4 20 36 5l32 15M8 24h56M9 56h54M14 28v23M36 28v23M58 28v23M7 60h58" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m26 17 10-5 10 5" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
    <span className="brand-name">RTM{' '}<span>ADVOCACIA</span></span>
  </a>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('civil');
  const [panel, setPanel] = useState<Panel>(null);
  const [active, setActive] = useState('inicio');
  const [contactNotice, setContactNotice] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-20% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); document.getElementById('menu-toggle')?.focus(); } };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  return <>
    <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <div className="review-banner"><span className="review-dot" />Versão de apresentação <span className="banner-divider">/</span> Conteúdo institucional em revisão</div>
    <header className="header">
      <div className="header-inner container">
        <Brand />
        <button id="menu-toggle" className="icon-button menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav id="navigation" className={menuOpen ? 'nav is-open' : 'nav'} aria-label="Navegação principal">
          {navItems.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="nav-contact" href="#contato" onClick={() => setMenuOpen(false)}>Vamos conversar <ArrowUpRight size={16} /></a>
        </nav>
      </div>
    </header>

    <main id="conteudo" tabIndex={-1}>
      <section id="inicio" className="hero">
        <div className="hero-copy">
          <div className="hero-copy-inner">
            <span className="eyebrow"><span className="small-rule" /> DIREITO COM PROPÓSITO</span>
            <h1>Clareza para decidir.<br />Proximidade<br />para <em>seguir.</em></h1>
            <p>Por trás de cada questão jurídica, existe uma história.<br className="desktop-break" /> A nossa atuação começa por ouvir a sua.</p>
            <a className="button button-blue" href="#escritorio">Conheça a RTM <ArrowUpRight size={19} /></a>
            <div className="hero-bottom"><span>ATENÇÃO À SUA HISTÓRIA.<br /><strong>COMPROMISSO COM O SEU DIREITO.</strong></span><a href="#escritorio" className="scroll-arrow" aria-label="Explorar o escritório"><ArrowDown size={20} /></a></div>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/images/architecture-1000.webp" srcSet="/images/architecture-640.webp 640w, /images/architecture-1000.webp 1000w" sizes="(max-width: 560px) 100vw, 48vw" alt="Composição arquitetônica de linhas curvas, luz e sombra" width="1000" height="1250" fetchPriority="high" />
          <div className="hero-image-shade" />
          <span className="image-caption">NOVOS OLHARES.<br />RELAÇÕES SÓLIDAS.</span>
          <span className="image-index"><span /> RTM — ADVOCACIA</span>
        </div>
      </section>

      <div className="practice-strip" aria-label="Nossas áreas"><div className="container practice-strip-inner"><span>UMA ATUAÇÃO CONECTADA À SUA VIDA</span><a href="#area-civil">Direito Civil <ArrowUpRight size={15} /></a><a href="#area-consumidor">Direito do Consumidor <ArrowUpRight size={15} /></a><a href="#area-medico">Direito Médico <ArrowUpRight size={15} /></a></div></div>

      <section id="escritorio" className="about section-pad container">
        <div className="section-label"><span className="section-number">01 /</span><span className="eyebrow">O ESCRITÓRIO</span></div>
        <div className="about-grid">
          <h2>O Direito é sobre pessoas.<br />A nossa advocacia <em>também.</em></h2>
          <div className="about-copy"><p className="lead">Entender o seu momento é o primeiro passo para uma orientação jurídica que faça sentido.</p><p>Na RTM Advocacia, o atendimento personalizado orienta a nossa forma de trabalhar. Escutamos com atenção, esclarecemos possibilidades e acompanhamos cada questão de perto.</p><p>Unimos uma visão contemporânea do Direito à proximidade no relacionamento. Porque confiança se constrói com presença, diálogo e responsabilidade.</p><a className="text-link" href="#equipe">Conheça quem está ao seu lado <ArrowUpRight size={18} /></a></div>
        </div>
        <div className="values"><div><span className="value-marker">01</span><h3>Escuta atenta</h3><p>Espaço para entender o que realmente importa para você.</p></div><div><span className="value-marker">02</span><h3>Orientação clara</h3><p>Informação acessível para decisões mais conscientes.</p></div><div><span className="value-marker">03</span><h3>Presença de verdade</h3><p>Um relacionamento próximo em cada etapa do caminho.</p></div></div>
      </section>

      <section id="atuacao" className="practice section-pad">
        <div className="container">
          <div className="section-label light"><span className="section-number">02 /</span><span className="eyebrow">ÁREAS DE ATUAÇÃO</span></div>
          <div className="practice-layout">
            <div className="practice-intro"><h2>Olhar atento.<br />Atuação <em>precisa.</em></h2><p>Questões diferentes exigem perspectivas específicas. Conheça as áreas em que podemos orientar você.</p><div className="practice-seal"><Scale strokeWidth={1} size={44} /><span>CONHECIMENTO JURÍDICO.<br />SENSIBILIDADE HUMANA.</span></div></div>
            <div className="practice-list">{practiceAreas.map(area => <article className={`practice-item ${expanded === area.id ? 'expanded' : ''}`} id={`area-${area.id}`} key={area.id}>
              <h3><button id={`trigger-${area.id}`} aria-expanded={expanded === area.id} aria-controls={`details-${area.id}`} onClick={() => setExpanded(expanded === area.id ? null : area.id)}><span className="area-number">{area.number}</span><span>{area.title}<small>{area.tag}</small></span><span className="area-toggle">{expanded === area.id ? <Minus size={20} /> : <Plus size={20} />}</span></button></h3>
              <div id={`details-${area.id}`} role="region" aria-labelledby={`trigger-${area.id}`} hidden={expanded !== area.id} className="area-details"><p>{area.text}</p><ul>{area.services.map(service => <li key={service}><span />{service}</li>)}</ul><a href="#contato" className="text-link">Converse com o escritório <ArrowUpRight size={17} /></a></div>
            </article>)}</div>
          </div>
        </div>
      </section>

      <section className="manifesto" aria-label="Nossa forma de atuar"><div className="container manifesto-inner"><span className="quote-mark" aria-hidden="true">“</span><p>Conhecimento para orientar.<br /><em>Proximidade para compreender.</em></p><span className="eyebrow">ESSA É A NOSSA FORMA<br />DE FAZER ADVOCACIA.</span></div></section>

      <section id="equipe" className="team section-pad container">
        <div className="section-label"><span className="section-number">03 /</span><span className="eyebrow">QUEM ESTÁ AO SEU LADO</span></div>
        <div className="section-heading"><h2>Pessoas que fazem<br />a <em>diferença.</em></h2><p>Uma equipe que acredita no diálogo e no cuidado com cada história.</p></div>
        <div className="team-grid">{team.map((person, index) => <button className="team-card" key={person.name} onClick={() => setPanel({ kind: 'profile', index })}>
          <div className={`team-portrait ${person.shade}`}><span className="portrait-grid" /><span className="portrait-initial" aria-hidden="true">{person.initials}</span><span className="portrait-note">RETRATO EM BREVE</span><span className="portrait-arrow"><ArrowUpRight size={20} /></span></div>
          <div className="team-info"><h3>{person.name}</h3><span>Equipe RTM Advocacia</span></div>
        </button>)}</div>
        <p className="editorial-note">Apresentações profissionais e fotografias em preparação.</p>
      </section>

      <section id="perspectivas" className="insights section-pad">
        <div className="container"><div className="section-label"><span className="section-number">04 /</span><span className="eyebrow">PERSPECTIVAS</span></div><div className="section-heading"><h2>Informação que<br />abre <em>caminhos.</em></h2><p>O Direito mais perto do seu dia a dia.<br />Conteúdos para uma leitura inicial.</p></div>
          <div className="insights-grid">{editorial.map((article, index) => <button className={`insight-card insight-${index}`} key={article.title} onClick={() => setPanel({ kind: 'article', index })}>
            <div className="insight-art" aria-hidden="true"><span /><span /><span /><span /><ArrowUpRight size={24} /></div>
            <div className="insight-body"><span className="eyebrow">{article.category}</span><h3>{article.title}</h3><div className="insight-meta"><span>{article.time}</span><span>Ler conteúdo <ArrowRight size={16} /></span></div></div>
          </button>)}</div><p className="editorial-note">Conteúdos introdutórios em revisão editorial. Não substituem a análise individual de um profissional.</p>
        </div>
      </section>

      <section id="contato" className="contact section-pad">
        <div className="container contact-grid"><div><div className="section-label light"><span className="section-number">05 /</span><span className="eyebrow">VAMOS CONVERSAR</span></div><h2>O primeiro passo<br />é uma <em>conversa.</em></h2><p>Conte com uma escuta atenta para compreender<br className="desktop-break" /> o seu momento e as suas necessidades.</p></div>
          <div className="contact-card"><span className="eyebrow">ATENDIMENTO RTM</span><h3>Estamos preparando<br />este espaço para você.</h3><p>Os canais oficiais de contato serão disponibilizados após a revisão das informações do escritório.</p><button className="button button-white" onClick={() => setContactNotice(!contactNotice)} aria-expanded={contactNotice}>Informações de atendimento {contactNotice ? <Check size={18} /> : <ArrowUpRight size={18} />}</button>{contactNotice && <div className="contact-notice" role="status">Este site está em apresentação. Telefone, e-mail, endereço e horários de atendimento ainda precisam ser confirmados pela RTM.</div>}<span className="contact-footnote">Seu primeiro contato será tratado com atenção e discrição.</span></div>
        </div>
      </section>
    </main>

    <footer className="footer"><div className="container"><div className="footer-top"><Brand footer /><p>Direito com clareza.<br />Relações com confiança.</p><a href="#inicio" className="back-top">Voltar ao início <MoveUpRight size={17} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RTM Advocacia.</span><button onClick={() => setPanel({ kind: 'privacy' })}>Privacidade e proteção de dados <ChevronRight size={13} /></button><span>Conteúdo informativo. Versão em revisão.</span></div></div></footer>

    {panel && <Modal title={panel.kind === 'article' ? editorial[panel.index].title : panel.kind === 'profile' ? team[panel.index].name : 'Privacidade e proteção de dados'} onClose={() => setPanel(null)}>
      {panel.kind === 'article' && <><span className="modal-category">{editorial[panel.index].category} · CONTEÚDO EM REVISÃO</span><p>{editorial[panel.index].text}</p><aside className="modal-disclaimer">Este conteúdo tem caráter informativo e não constitui orientação jurídica individual. Cada situação deve ser avaliada por profissional habilitado.</aside><a href="#contato" className="text-link" onClick={() => setPanel(null)}>Informações de atendimento <ArrowUpRight size={18} /></a></>}
      {panel.kind === 'profile' && <><p>Integrante da equipe RTM Advocacia.</p><p>A apresentação profissional está em preparação. A biografia, o nome completo, a fotografia e o registro na OAB serão incluídos após a validação do escritório.</p><a href="#contato" className="text-link" onClick={() => setPanel(null)}>Conheça os canais de atendimento <ArrowUpRight size={18} /></a></>}
      {panel.kind === 'privacy' && <><p>Esta versão de apresentação não contém formulário de contato, ferramentas de publicidade ou análise de audiência e não utiliza cookies ou armazenamento local pela aplicação. As fontes e imagens são servidas junto com o próprio site.</p><p>A infraestrutura de hospedagem poderá processar dados técnicos de acesso, como endereço IP, de acordo com sua configuração. O responsável pelo tratamento, o canal para exercício dos direitos dos titulares, as bases legais e os prazos de retenção precisam ser confirmados antes da publicação.</p><aside className="modal-disclaimer">Aviso preliminar em revisão. A versão definitiva deverá refletir os serviços e processos efetivamente utilizados pelo escritório.</aside></>}
    </Modal>}
  </>;
}
