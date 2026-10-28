import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Minus, Menu, X, MoveUpRight, Check, ChevronRight } from 'lucide-react';
import { practiceAreas, team, editorial, homepageCopy as copy, processSteps, faqs } from './data/content';
import { type ImageKey } from './data/images';
import { Modal } from './components/Modal';
import { EditorialImage } from './components/EditorialImage';
import { EditorialHeading } from './components/EditorialHeading';
import { usePageMotion } from './components/usePageMotion';
import { HeroBanner } from './components/HeroBanner';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { contact, getWhatsAppUrl } from './data/contact';

type Panel = { kind: 'article' | 'profile' | 'practice'; index: number } | { kind: 'privacy' | 'terms' } | null;
type Category = 'todos' | 'civil' | 'consumidor' | 'medico';
const navItems = [['Início', 'inicio'], ['O escritório', 'escritorio'], ['Áreas de atuação', 'atuacao'], ['Equipe', 'equipe'], ['Publicações', 'publicacoes']];
const categories: { id: Category; label: string }[] = [
  { id: 'todos', label: 'Todos os temas' }, { id: 'civil', label: 'Direito Civil' },
  { id: 'consumidor', label: 'Consumidor' }, { id: 'medico', label: 'Direito Médico' },
];
const practiceImages: ImageKey[] = ['property-editorial', 'consumer-rights-editorial', 'health-editorial'];

function Brand({ footer = false }: { footer?: boolean }) {
  return <a href="#inicio" className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="RTM ADVOCACIA — início">
    <svg className="brand-symbol" viewBox="0 0 72 65" aria-hidden="true"><path d="M4 20 36 5l32 15M8 24h56M9 56h54M14 28v23M36 28v23M58 28v23M7 60h58" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m26 17 10-5 10 5" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
    <span className="brand-name">RTM{' '}<span>ADVOCACIA</span></span>
  </a>;
}

function SectionLabel({ number, children, light = false }: { number: string; children: string; light?: boolean }) {
  return <div className={`section-label ${light ? 'light' : ''}`}><span className="section-number">{number} /</span><span className="eyebrow">{children}</span></div>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('civil');
  const [panel, setPanel] = useState<Panel>(null);
  const [active, setActive] = useState('inicio');
  const [contactNotice, setContactNotice] = useState(false);
  const [category, setCategory] = useState<Category>('todos');
  usePageMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-15% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); document.getElementById('menu-toggle')?.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  const filteredArticles = editorial.map((article, index) => ({ ...article, index })).filter(article => category === 'todos' || article.categoryKey === category);
  const whatsappHref = getWhatsAppUrl(contact.whatsappNumber);
  const panelTitle = !panel ? '' : panel.kind === 'article' ? editorial[panel.index].title : panel.kind === 'profile' ? team[panel.index].name : panel.kind === 'practice' ? practiceAreas[panel.index].detailsTitle : panel.kind === 'privacy' ? 'Privacidade e proteção de dados' : 'Termos de uso';

  return <>
    <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <div className="review-banner"><span className="review-dot" />Versão de apresentação <span className="banner-divider">/</span> Conteúdo institucional em revisão</div>
    <header className="header">
      <div className="reading-progress" aria-hidden="true" />
      <div className="header-inner container">
        <Brand />
        <button id="menu-toggle" className="icon-button menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav id="navigation" className={menuOpen ? 'nav is-open' : 'nav'} aria-label="Navegação principal">
          {navItems.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="nav-contact" href="#contato" onClick={() => setMenuOpen(false)}>Fale com o escritório <ArrowUpRight size={17} /></a>
        </nav>
      </div>
    </header>

    <main id="conteudo" tabIndex={-1}>
      <HeroBanner />

      <div className="practice-strip" aria-label="Principais serviços"><div className="container"><span className="eyebrow">PRINCIPAIS SERVIÇOS</span><div className="service-links">{copy.hero.services.map((service, index) => <a key={service} href={`#area-${index < 3 ? 'civil' : index < 5 ? 'consumidor' : 'medico'}`}>{service}<ArrowUpRight size={14} /></a>)}</div></div></div>

      <section id="escritorio" className="about section-pad container">
        <div data-reveal><SectionLabel number="01">{copy.about.label}</SectionLabel></div>
        <div className="about-grid" data-reveal><EditorialHeading text={copy.about.title} accent="individualizado." /><div className="about-copy">{copy.about.paragraphs.map((paragraph, index) => <p className={index === 0 ? 'lead' : ''} key={paragraph}>{paragraph}</p>)}<a className="text-link" href="#equipe">{copy.about.action}<ArrowUpRight size={19} /></a></div></div>
        <div className="about-editorial" data-reveal><div className="about-image-stack"><figure className="editorial-photo"><EditorialImage image="office-editorial" sizes="(max-width: 700px) 100vw, 70vw" /><figcaption>ESPAÇO PARA O DIÁLOGO<span>Imagem ilustrativa</span></figcaption></figure><figure className="about-inset"><EditorialImage image="consultation-editorial" sizes="(max-width: 700px) 45vw, 25vw" /><figcaption>ATENÇÃO A CADA DETALHE</figcaption></figure></div><div className="about-statement"><span className="statement-mark" aria-hidden="true">“</span><p>{copy.about.commitment}</p><span className="eyebrow">NOSSA FORMA DE ATUAR</span><a href="#forma-atuacao" className="circle-link" aria-label="Conhecer nossa forma de atuar"><ArrowDown size={20} /></a></div></div>
      </section>

      <section id="atuacao" className="practice section-pad"><div className="container">
        <div data-reveal><SectionLabel number="02" light>{copy.practice.label}</SectionLabel></div>
        <div className="practice-layout practice-showcase"><div className="practice-intro" data-reveal><EditorialHeading text={copy.practice.title} accent="necessidades." /><p>{copy.practice.text}</p></div>
          <div className="practice-gallery">{practiceAreas.map((area, index) => <button className="practice-visual-card" key={area.id} onClick={() => { setExpanded(area.id); document.getElementById(`area-${area.id}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); }}>
            <EditorialImage image={practiceImages[index]} sizes="(max-width: 700px) 100vw, 33vw" decorative />
            <span className="practice-card-shade" /><span className="practice-card-number">{area.number}</span><span className="practice-card-copy"><span>{area.title}</span><small>Conheça a atuação<ArrowUpRight size={17} /></small></span>
          </button>)}</div>
          <div className="practice-list" data-reveal data-reveal-delay="100">{practiceAreas.map((area, index) => <article className={`practice-item ${expanded === area.id ? 'expanded' : ''}`} id={`area-${area.id}`} key={area.id}>
            <h3><button id={`trigger-${area.id}`} aria-expanded={expanded === area.id} aria-controls={`details-${area.id}`} onClick={() => setExpanded(expanded === area.id ? null : area.id)}><span className="area-number">{area.number}</span><span>{area.title}<small>{area.tag}</small></span><span className="area-toggle">{expanded === area.id ? <Minus size={20} /> : <Plus size={20} />}</span></button></h3>
            <div id={`details-${area.id}`} role="region" aria-labelledby={`trigger-${area.id}`} hidden={expanded !== area.id} className="area-details"><p>{area.text}</p><ul>{area.services.map(service => <li key={service}><span />{service}</li>)}</ul><button className="text-link" onClick={() => setPanel({ kind: 'practice', index })}>Saiba mais sobre {area.title}<ArrowUpRight size={17} /></button></div>
          </article>)}</div>
        </div>
      </div></section>

      <section id="forma-atuacao" className="process section-pad container">
        <div data-reveal><SectionLabel number="03">{copy.process.label}</SectionLabel></div><div className="section-heading process-heading" data-reveal><EditorialHeading text={copy.process.title} accent="cada demanda." /><div>{copy.process.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></div>
        <div className="process-steps">{processSteps.map((step, index) => <article className="process-step" key={step.number} data-reveal data-reveal-delay={index * 70}><span className="step-number">{step.number}</span><span className="step-track" aria-hidden="true" /><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      </section>

      <section className="image-interlude" aria-label="Atendimento e atenção aos detalhes"><div className="interlude-photo"><EditorialImage image="law-library-editorial" sizes="100vw" /></div><div className="interlude-overlay" /><div className="container interlude-content" data-reveal><span className="eyebrow">RTM ADVOCACIA</span><p>Confiança, transparência<br />e <em>comunicação direta.</em></p><a href="#equipe" className="circle-link" aria-label="Conhecer a equipe"><ArrowUpRight size={26} /></a></div></section>

      <section id="equipe" className="team section-pad container">
        <div data-reveal><SectionLabel number="04">{copy.team.label}</SectionLabel></div><div className="section-heading" data-reveal><EditorialHeading text={copy.team.title} accent="RTM Advocacia." /><p>{copy.team.text}</p></div>
        <div className="team-grid">{team.map((person, index) => <button className="team-card" key={person.name} onClick={() => setPanel({ kind: 'profile', index })} data-reveal data-reveal-delay={index * 60}><div className={`team-portrait ${person.shade}`}>{person.photo ? <img src={person.photo} alt={person.photoAlt || `Retrato de ${person.name}`} width="600" height="750" loading="lazy" decoding="async" /> : <><span className="portrait-grid" /><span className="portrait-initial" aria-hidden="true">{person.initials}</span><span className="portrait-note">FOTOGRAFIA EM BREVE</span></>}<span className="portrait-arrow"><ArrowUpRight size={21} /></span></div><div className="team-info"><div><h3>{person.name}</h3><span>{person.role}</span></div><span className="profile-link">Ver perfil<ArrowUpRight size={15} /></span></div></button>)}</div>
        <p className="editorial-note">Fotografias, biografias e registros profissionais serão incluídos após a validação do escritório.</p>
      </section>

      <section id="publicacoes" className="insights section-pad"><span id="perspectivas" className="anchor-alias" /><div className="container">
        <div data-reveal><SectionLabel number="05">{copy.publications.label}</SectionLabel></div><div className="section-heading" data-reveal><EditorialHeading text={copy.publications.title} accent="informação." /><p>{copy.publications.text}</p></div>
        <div className="publication-toolbar"><div className="category-filters" role="group" aria-label="Filtrar publicações por área">{categories.map(item => <button aria-pressed={category === item.id} key={item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div><span className="result-count" role="status" aria-live="polite">{filteredArticles.length} {filteredArticles.length === 1 ? 'conteúdo' : 'conteúdos'}</span></div>
        <div className={`insights-grid ${category !== 'todos' ? 'is-filtered' : ''}`}>{filteredArticles.map(article => <button className="insight-card" key={article.title} onClick={() => setPanel({ kind: 'article', index: article.index })}><div className="insight-art"><EditorialImage image={article.imageKey} decorative sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 40vw" /><span className="insight-image-shade" /><span className="insight-open"><ArrowUpRight size={23} /></span></div><div className="insight-body"><span className="eyebrow">{article.category}</span><h3>{article.title}</h3><p>{article.excerpt}</p><div className="insight-meta"><span>PAUTA EM PREPARAÇÃO</span><span>Ver tema<ArrowRight size={16} /></span></div></div></button>)}</div>
        <p className="editorial-note">Pautas sugeridas em preparação editorial. Os artigos completos serão incluídos após revisão do escritório.</p>
      </div></section>

      <section id="duvidas" className="faq section-pad container"><div className="faq-intro" data-reveal><SectionLabel number="06">{copy.faq.label}</SectionLabel><EditorialHeading text={copy.faq.title} accent="frequentes" /><p>Informações iniciais sobre as áreas e os serviços do escritório.</p><a href="#contato" className="text-link">Fale com o escritório<ArrowUpRight size={18} /></a></div><div className="faq-list" data-reveal data-reveal-delay="80">{faqs.map((faq, index) => <details className="faq-item" key={faq.question}><summary><span className="faq-number">0{index + 1}</span><span>{faq.question}</span><Plus className="faq-plus" size={18} /></summary><p>{faq.answer}</p></details>)}</div></section>

      <section id="contato" className="contact section-pad"><div className="contact-decoration" aria-hidden="true" /><div className="container contact-grid">
        <div data-reveal><SectionLabel number="07" light>{copy.contact.label}</SectionLabel><EditorialHeading text={copy.contact.title} accent="Médica." /><p>{copy.contact.text}</p></div>
        <div className="contact-card" data-reveal data-reveal-delay="100"><span className="eyebrow">FALE COM NOSSA EQUIPE</span><h3>O primeiro passo<br />é uma conversa.</h3><p>{whatsappHref ? `Entre em contato pelo WhatsApp ${contact.whatsappNumber}. Nossa equipe poderá orientar sobre o atendimento.` : 'Os canais oficiais de contato serão disponibilizados após a revisão das informações do escritório.'}</p>{whatsappHref && <a className="button button-white" href={whatsappHref} target="_blank" rel="noopener noreferrer">Fale pelo WhatsApp<ArrowUpRight size={18} /></a>}<button className="contact-more" onClick={() => setContactNotice(!contactNotice)} aria-expanded={contactNotice} aria-controls="contact-information">Informações de atendimento{contactNotice ? <Check size={16} /> : <Plus size={16} />}</button><div id="contact-information" hidden={!contactNotice} className="contact-notice" role="status">E-mail, endereço e horários de atendimento ainda precisam ser confirmados pela RTM.</div><span className="contact-footnote">Atendimento próximo, com atenção a cada demanda.</span></div>
      </div></section>
    </main>

    <footer className="footer"><div className="container"><div className="footer-top"><div><Brand footer /><p className="footer-description">{copy.footer.description}</p></div><div className="footer-navigation"><span className="eyebrow">EXPLORE</span>{navItems.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}<a href="#contato">Contato</a></div><div className="footer-areas"><span className="eyebrow">ÁREAS DE ATUAÇÃO</span>{practiceAreas.map(area => <a href={`#area-${area.id}`} key={area.id}>{area.title}</a>)}<a href="#duvidas">Dúvidas frequentes</a></div><a href="#inicio" className="back-top" aria-label="Voltar ao início"><MoveUpRight size={22} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RTM Advocacia.</span><div><button onClick={() => setPanel({ kind: 'privacy' })}>Privacidade e proteção de dados<ChevronRight size={13} /></button><button onClick={() => setPanel({ kind: 'terms' })}>Termos de uso<ChevronRight size={13} /></button></div><span>Identificação profissional e conteúdo em revisão.</span></div></div></footer>

    <FloatingWhatsApp />

    {panel && <Modal title={panelTitle} onClose={() => setPanel(null)}>
      {panel.kind === 'practice' && <><div className="modal-photo"><EditorialImage image={practiceImages[panel.index]} /></div>{practiceAreas[panel.index].detailsIntro.map(text => <p key={text}>{text}</p>)}<div className="service-details">{practiceAreas[panel.index].details.map(detail => <div key={detail.title}><h3>{detail.title}</h3><p>{detail.text}</p></div>)}</div><a href="#contato" className="text-link" onClick={() => setPanel(null)}>Entre em contato<ArrowUpRight size={18} /></a></>}
      {panel.kind === 'article' && <><div className="modal-photo"><EditorialImage image={editorial[panel.index].imageKey} /></div><span className="modal-category">{editorial[panel.index].category} · PAUTA EM PREPARAÇÃO</span><p>{editorial[panel.index].text}</p><aside className="modal-disclaimer">Tema sugerido para publicação. O artigo completo ainda está em preparação e depende da revisão do escritório.</aside><a href="#contato" className="text-link" onClick={() => setPanel(null)}>Informações de atendimento<ArrowUpRight size={18} /></a></>}
      {panel.kind === 'profile' && <><p>Integrante da equipe RTM Advocacia.</p><p>A apresentação profissional está em preparação. A biografia, o nome completo, a fotografia e o registro na OAB serão incluídos após a validação do escritório.</p><a href="#contato" className="text-link" onClick={() => setPanel(null)}>Conheça os canais de atendimento<ArrowUpRight size={18} /></a></>}
      {panel.kind === 'privacy' && <><p>Esta versão de apresentação não contém formulário de contato, ferramentas de publicidade ou análise de audiência e não utiliza cookies ou armazenamento local pela aplicação. As fontes e imagens são servidas junto com o próprio site.</p><p>Ao escolher o WhatsApp, você será direcionado para um serviço externo, sujeito aos seus próprios termos e política de privacidade.</p><p>A infraestrutura de hospedagem poderá processar dados técnicos de acesso, como endereço IP, de acordo com sua configuração. O responsável pelo tratamento, o canal para exercício dos direitos dos titulares, as bases legais e os prazos de retenção precisam ser confirmados antes da publicação.</p><aside className="modal-disclaimer">Aviso preliminar em revisão. A versão definitiva deverá refletir os serviços e processos efetivamente utilizados pelo escritório.</aside></>}
      {panel.kind === 'terms' && <><p>Os conteúdos desta apresentação são informativos e não substituem a análise individualizada de um profissional habilitado. A consulta ao site não constitui contratação de serviços jurídicos.</p><p>As imagens de ambientes e objetos são ilustrativas. Os canais de atendimento, as apresentações dos profissionais e os textos editoriais estão em revisão.</p><aside className="modal-disclaimer">Documento preliminar. Os termos definitivos serão validados pelo escritório antes da publicação.</aside></>}
    </Modal>}
  </>;
}
