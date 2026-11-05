import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { apiRequest } from './api';
import { categories, type BlogPost } from './types';

export function HomeBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    apiRequest<{ posts: BlogPost[] }>('posts', { signal: controller.signal })
      .then(data => setPosts(data.posts.slice(0, 3)))
      .catch(() => { /* A apresentação estática mantém as pautas já existentes. */ });
    return () => controller.abort();
  }, []);

  return <div className="home-blog">
    <div className="home-blog-top"><p>Artigos e novidades do escritório em um espaço dedicado à informação.</p><a href="/blog/" className="text-link">Visitar o blog<ArrowUpRight size={18} /></a></div>
    {posts.length > 0 && <>
      <div className="home-blog-grid">{posts.map(post => <a className="home-blog-card" href={`/blog/?artigo=${encodeURIComponent(post.slug)}`} key={post.id}>
        <img src={post.image} alt={post.imageAlt} width="800" height="500" loading="lazy" decoding="async" />
        <span className="eyebrow">{categories.find(category => category.id === post.category)?.label}</span>
        <h3>{post.title}</h3><p>{post.excerpt}</p><span className="text-link">Ler publicação<ArrowUpRight size={16} /></span>
      </a>)}</div>
      <p className="eyebrow home-blog-drafts">PAUTAS EM PREPARAÇÃO</p>
    </>}
  </div>;
}
