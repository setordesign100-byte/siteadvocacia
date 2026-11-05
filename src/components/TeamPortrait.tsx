import type { TeamMember } from '../data/content';

export function TeamPortrait({ person, profile = false }: { person: TeamMember; profile?: boolean }) {
  if (!person.photo) return null;

  return <img
    src={person.photo}
    srcSet={person.photoSmall ? `${person.photoSmall} 450w, ${person.photo} 900w` : undefined}
    sizes={profile ? '(max-width: 400px) 70vw, 260px' : '(max-width: 800px) 45vw, (max-width: 1440px) 23vw, 312px'}
    alt={person.photoAlt || `Retrato de ${person.name}`}
    width="900"
    height="900"
    loading={profile ? 'eager' : 'lazy'}
    decoding="async"
  />;
}
