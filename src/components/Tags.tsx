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
      <header className="relative border-b-[3px] border-bone px-6 py-8 md:px-12 md:py-10 shrink-0 overflow-hidden">
        <div className="hazard absolute inset-x-0 top-0 h-2 opacity-70" aria-hidden="true" />
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="mt-2 mb-8 stamp px-3 py-1 border-2 border-bone font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-ink hover:text-bone transition-colors askew-1"
        >
          &larr; Inicio
        </button>
        <h2 className="ink-bleed misprint xerox-rough font-display text-6xl md:text-8xl uppercase tracking-tight leading-[0.82]">
          Etiquetas
        </h2>
      </header>

      <div className="border-b-[3px] border-bone px-6 py-6 md:px-12 shrink-0">
        <input
          type="text"
          placeholder="Buscar etiquetas o texto en poemas…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-2 border-bone bg-ink px-4 py-3 font-mono text-sm text-bone placeholder:text-bone-faint outline-none focus:shadow-xerox-sm transition-shadow"
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
            <div className="flex flex-wrap gap-x-4 gap-y-5 md:gap-x-6 items-center max-w-5xl mx-auto">
              {filteredTags.map(([tag, count], i) => {
                const isLarge = !searchTerm && count > 5;
                const isMedium = !searchTerm && count > 2 && count <= 5;

                // Ransom-note: piezas apenas torcidas y tipografías mezcladas.
                const skew = ['askew-1', 'askew-2', 'askew-3', ''][i % 4];
                const face = isLarge
                  ? 'font-display uppercase'
                  : isMedium
                  ? (i % 2 ? 'font-block uppercase' : 'font-serif italic')
                  : 'font-mono';

                return (
                  <button
                    key={tag}
                    onClick={() => onNavigate({ type: 'results', tag })}
                    className={`group inline-flex items-center gap-2 border-2 border-bone px-3 py-1 bg-ink text-bone hover:bg-bone hover:text-ink transition-colors ${skew} hover:rotate-0 hover:shadow-xerox-sm`}
                  >
                    <span
                      className={`tracking-tight leading-none ${face} ${
                        isLarge
                          ? 'text-4xl md:text-6xl'
                          : isMedium
                          ? 'text-2xl md:text-3xl'
                          : 'text-base md:text-lg'
                      }`}
                    >
                      {tag}
                    </span>
                    <span className="stamp group-hover:bg-ink group-hover:text-bone font-mono text-[10px] px-1.5 py-0.5 leading-none self-start transition-colors">
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
              className="w-full border-2 border-bone bg-ink px-6 py-6 md:px-10 md:py-8 text-left hover:bg-bone hover:text-ink transition-colors duration-150 flex items-center justify-between gap-4 group shadow-xerox hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]"
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
          <div className="flex justify-center mt-14">
            <span className="stamp px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] askew-1">
              No se encontraron resultados
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
