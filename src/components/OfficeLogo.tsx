import './OfficeLogo.css';

export function OfficeLogo({ className = '' }: { className?: string }) {
  return <img className={`office-logo ${className}`} src="/images/logo-rtm.webp" width="640" height="407" alt="RTM Advocacia" decoding="async" />;
}
