import { ArrowDown, ArrowUpRight, ArrowRight } from 'lucide-react';
import { homepageCopy } from '../data/content';
import { EditorialHeading } from './EditorialHeading';
import { EditorialImage } from './EditorialImage';
import './HeroBanner.css';

export function HeroBanner() {
  const copy = homepageCopy.hero;
  return <section id="inicio" className="hero hero-immersive">
    <div className="hero-visual"><EditorialImage image="legal-specialties-hero" priority sizes="100vw" decorative /></div>
    <div className="hero-scrim" aria-hidden="true" />
    <div className="hero-content container">
      <div className="hero-main">
        <span className="eyebrow hero-enter"><span className="small-rule" />{copy.label}</span>
        <EditorialHeading as="h1" className="hero-enter" text={copy.title} accent="seus direitos," />
        <p className="hero-description hero-enter">{copy.text}</p>
        <div className="hero-actions hero-enter">
          <a className="button button-blue" href="#atuacao">{copy.primaryAction}<ArrowUpRight size={19} /></a>
          <a className="hero-secondary" href="#contato">{copy.secondaryAction}<ArrowRight size={17} /></a>
        </div>
      </div>
      <div className="hero-footer">
        <span className="hero-signature">ATUAÇÃO TÉCNICA.<br />ATENDIMENTO INDIVIDUALIZADO.</span>
        <div className="hero-specialties" aria-label="Áreas do escritório"><span>Direito Civil</span><span>Direito do Consumidor</span><span>Direito Médico</span></div>
        <a href="#escritorio" className="scroll-arrow" aria-label="Explorar o escritório"><ArrowDown size={20} /></a>
      </div>
    </div>
  </section>;
}
