import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { contact, getWhatsAppUrl } from '../data/contact';
import { Modal } from './Modal';
import './FloatingWhatsApp.css';

function WhatsAppIcon() {
  return <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false" fill="none">
    <path d="M27.4 15.6A11.4 11.4 0 0 1 10.2 25.5L4.4 27l1.5-5.6A11.4 11.4 0 1 1 27.4 15.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m11.8 9.6 1.7 3.3-1.3 1.5c.9 2.1 2.6 3.8 4.8 4.7l1.5-1.4 3.1 1.6c.5.3.5.6.3 1.1-.6 1.3-1.7 1.9-3.2 1.6-5.3-1.1-9.8-5.6-10.5-9.4-.3-1.5.2-2.5 1.4-3.3.9-.6 1.6-.4 2.2.3Z" fill="currentColor" />
  </svg>;
}

export function FloatingWhatsApp({ number = contact.whatsappNumber }: { number?: string }) {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const href = getWhatsAppUrl(number);
  const content = <><WhatsAppIcon /><span className="whatsapp-float-label">WhatsApp</span></>;

  return <>
    {href ? <a className="whatsapp-float" href={href} target="_blank" rel="noopener noreferrer"
      aria-label="WhatsApp — fale com o escritório (abre em nova aba)">{content}</a> :
      <button type="button" className="whatsapp-float" onClick={() => setNoticeOpen(true)}
        aria-label="WhatsApp — informações de atendimento" aria-haspopup="dialog">{content}</button>}

    {noticeOpen && <Modal title="Atendimento pelo WhatsApp" onClose={() => setNoticeOpen(false)}>
      <p>O número oficial de WhatsApp do escritório ainda será informado.</p>
      <p>Assim que o canal estiver confirmado, este botão abrirá uma conversa diretamente com a RTM Advocacia.</p>
      <div className="whatsapp-notice">Os canais de atendimento desta versão de apresentação estão em atualização.</div>
      <a className="text-link" href="#contato" onClick={() => setNoticeOpen(false)}>Informações de atendimento<ArrowUpRight size={18} /></a>
    </Modal>}
  </>;
}
