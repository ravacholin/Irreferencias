import React, { useState, useMemo } from 'react';
import { BloggerPost, ViewState } from '../types';

interface ListProps {
  posts: BloggerPost[];
  tag?: string;
  onNavigate: (view: ViewState) => void;
}

export function List({ posts, tag: initialTag, onNavigate }: ListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [posts]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags = selectedTags.length === 0 || selectedTags.every(t => p.tags.includes(t));
      return matchesSearch && matchesTags;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.published).getTime();
      const dateB = new Date(b.published).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [posts, searchTerm, selectedTags, sortOrder]);

  return (
    <div className="flex flex-col h-full bg-ink text-bone">
      <header className="border-b border-rule px-6 py-8 md:px-12 md:py-10 shrink-0">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="mb-8 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim hover:text-bone transition-colors"
        >
          &larr; Inicio
        </button>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.9]">
            Índice
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim self-start md:self-auto">
            {filteredPosts.length} resultados
          </span>
        </div>
      </header>

      <div className="border-b border-rule px-6 py-6 md:px-12 flex flex-col gap-6 shrink-0">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por título…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-hairline bg-ink-2 px-4 py-3 text-sm text-bone placeholder:text-bone-faint outline-none focus:border-bone transition-colors"
          />
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="border border-hairline bg-ink-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-dim hover:text-bone hover:border-bone transition-colors whitespace-nowrap"
          >
            Fecha · {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-faint">
            Filtrar por etiquetas
          </span>
          <div className="flex flex-wrap gap-2">
            {allTags.map(t => {
              const isSelected = selectedTags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`px-3 py-1 text-xs font-mono tracking-wide transition-colors border ${
                    isSelected
                      ? 'bg-bone text-ink border-bone'
                      : 'bg-transparent text-bone-dim border-hairline hover:text-bone hover:border-bone-dim'
                  }`}
                >
                  #{t}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-3 py-1 text-xs font-mono tracking-wide border border-dashed border-bone-faint text-bone-dim hover:text-bone hover:border-bone transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-hairline">
          {filteredPosts.map((post, index) => {
            const date = new Date(post.published);
            const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
            return (
              <li
                key={post.id}
                className="group hover:bg-ink-2 transition-colors duration-200"
              >
                <div className="px-6 py-6 md:px-12 md:py-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <button
                    onClick={() => onNavigate({ type: 'reader', postIndex: index, posts: filteredPosts })}
                    className="text-left flex flex-col gap-2 pr-4 flex-1 min-w-0"
                  >
                    <span className="font-mono text-[10px] tracking-[0.25em] text-bone-faint group-hover:text-bone-dim transition-colors">
                      {dateStr}
                    </span>
                    <span className="text-2xl md:text-3xl font-medium tracking-tight leading-tight text-bone">
                      {post.title}
                    </span>
                  </button>
                  {post.tags.length > 0 && (
                    <div className="hidden md:flex gap-2 shrink-0">
                      {post.tags.slice(0, 3).map(t => (
                        <button
                          key={t}
                          onClick={() => onNavigate({ type: 'results', tag: t })}
                          className="border border-hairline px-2 py-1 font-mono text-[10px] text-bone-dim hover:text-ink hover:bg-bone hover:border-bone transition-colors"
                          title={`Ver poemas de #${t}`}
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
