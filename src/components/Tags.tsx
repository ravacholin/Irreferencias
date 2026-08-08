import React, { useMemo, useState } from 'react';
import { BloggerPost, ViewState } from '../types';

interface TagsProps {
  posts: BloggerPost[];
  onNavigate: (view: ViewState) => void;
}

export function Tags({ posts, onNavigate }: TagsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const filteredTags = useMemo(() => {
    if (!searchTerm) return tagCounts;
    const lowerSearch = searchTerm.toLowerCase();
    return tagCounts.filter(([tag]) => tag.toLowerCase().includes(lowerSearch));
  }, [tagCounts, searchTerm]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearch = searchTerm.toLowerCase();
    return posts.filter(post =>
      post.title.toLowerCase().includes(lowerSearch) ||
      post.content.toLowerCase().includes(lowerSearch)
    );
  }, [posts, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-ink text-bone">
      <header className="border-b border-rule px-6 py-8 md:px-12 md:py-10 shrink-0">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="mb-8 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim hover:text-bone transition-colors"
        >
          &larr; Inicio
        </button>
        <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.9]">
          Etiquetas
        </h2>
      </header>

      <div className="border-b border-rule px-6 py-6 md:px-12 shrink-0">
        <input
          type="text"
          placeholder="Buscar etiquetas o texto en poemas…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-hairline bg-ink-2 px-4 py-3 text-sm text-bone placeholder:text-bone-faint outline-none focus:border-bone transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10 md:px-12 md:py-14">
        {filteredTags.length > 0 && (
          <div className="mb-14">
            {searchTerm && (
              <h3 className="mb-8 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim">
                Etiquetas · {filteredTags.length}
              </h3>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-6 md:gap-x-8 items-baseline max-w-5xl mx-auto">
              {filteredTags.map(([tag, count]) => {
                const isLarge = !searchTerm && count > 5;
                const isMedium = !searchTerm && count > 2 && count <= 5;
                const dim = !searchTerm && count === 1;

                return (
                  <button
                    key={tag}
                    onClick={() => onNavigate({ type: 'results', tag })}
                    className={`group inline-flex items-baseline gap-2 transition-colors hover:text-bone ${
                      dim ? 'text-bone-faint' : 'text-bone-dim'
                    }`}
                  >
                    <span
                      className={`tracking-tight ${
                        isLarge
                          ? 'text-4xl md:text-6xl font-semibold'
                          : isMedium
                          ? 'text-2xl md:text-3xl font-medium'
                          : 'text-lg md:text-xl font-normal'
                      }`}
                    >
                      {tag}
                    </span>
                    <span className="font-mono text-[10px] text-bone-faint group-hover:text-bone-dim transition-colors">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {searchTerm && filteredPosts.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <h3 className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim">
              Poemas · {filteredPosts.length}
            </h3>
            <button
              onClick={() => onNavigate({ type: 'results', query: searchTerm })}
              className="w-full border border-hairline bg-ink-2 px-6 py-6 md:px-10 md:py-8 text-left hover:bg-bone hover:text-ink transition-colors duration-200 flex items-center justify-between gap-4 group"
            >
              <span className="text-2xl md:text-3xl font-medium tracking-tight leading-none">
                Leer {filteredPosts.length} {filteredPosts.length === 1 ? 'poema' : 'poemas'}
              </span>
              <span className="font-mono text-lg md:text-2xl shrink-0 group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </button>
          </div>
        )}

        {searchTerm && filteredTags.length === 0 && filteredPosts.length === 0 && (
          <div className="text-center mt-14 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-faint">
            No se encontraron resultados
          </div>
        )}
      </div>
    </div>
  );
}
