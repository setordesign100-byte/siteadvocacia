export type BlogCategory = 'civil' | 'consumidor' | 'medico' | 'institucional';

export const categories: { id: BlogCategory; label: string }[] = [
  { id: 'civil', label: 'Direito Civil' },
  { id: 'consumidor', label: 'Direito do Consumidor' },
  { id: 'medico', label: 'Direito Médico' },
  { id: 'institucional', label: 'Institucional' },
];

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  image: string;
  imageAlt: string;
  author: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type BlogSession = {
  authenticated: boolean;
  setupRequired: boolean;
  setupConfigured: boolean;
  csrfToken: string;
  username?: string;
  role?: 'admin' | 'editor';
};
