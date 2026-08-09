import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BloggerPost, ViewState } from '../types';
import { PoemContent } from './PoemContent';

interface ResultsProps {
  posts: BloggerPost[];
  tag?: string;
  query?: string;
  onNavigate: (view: ViewState) => void;
}

function formatDate(published: string): string {
  const date = new Date(published);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${date.getFullYear()}`;
}

export function Results({ posts, tag, query, onNavigate }: ResultsProps) {
  const [searchTerm, setSearchTerm] = useState(query ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(tag ? [tag] : []);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Re-sincronizar cuando llega un nuevo hashtag/búsqueda por props
  // (p. ej. al clickear un hashtag mientras ya estás en esta vista).
  useEffect(() => {
    setSelectedTags(tag ? [tag] : []);
    setSearchTerm(query ?? '');
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  }, [tag, query]);

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  };

  const filteredPosts = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    const result = posts.filter((p) => {
      const matchesSearch =
        !lowerSearch ||
        p.title.toLowerCase().includes(lowerSearch) ||
        p.content.toLowerCase().includes(lowerSearch);
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((t) => p.tags.includes(t));
      return matchesSearch && matchesTags;
    });
    result.sort(
      (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
    );
    return result;
  }, [posts, searchTerm, selectedTags]);

  const contextLabel = useMemo(() => {
    const parts: string[] = [];
    if (selectedTags.length > 0) parts.push(selectedTags.map((t) => `#${t}`).join(' '));
    if (searchTerm.trim()) parts.push(`"${searchTerm.trim()}"`);
    return parts.join(' · ');
  }, [selectedTags, searchTerm]);

  const openReader = (index: number) => {
    onNavigate({
      type: 'reader',
      postIndex: index,
      posts: filteredPosts,
      contextLabel: contextLabel || undefined,
    });
  };

  return (
    <div className="flex flex-col h-full bg-ink text-bone">
      <header className="border-b-2 border-bone shrink-0">
        <div className="px-6 py-6 md:px-12 md:py-8 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="stamp px-3 py-1 border-2 border-bone font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-ink hover:text-bone transition-colors"
            >
              &larr; Inicio
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim border-2 border-bone px-3 py-1">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'poema' : 'poemas'}
            </span>
          </div>

          <input
            type="text"
            placeholder="Buscar en título y texto…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
            }}
            className="w-full border-2 border-bone bg-ink px-4 py-3 font-mono text-sm text-bone placeholder:text-bone-faint outline-none focus:shadow-xerox-sm transition-shadow"
          />

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedTags.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className="group flex items-center gap-2 bg-bone text-ink px-3 py-1 font-mono text-xs tracking-wide hover:bg-ink hover:text-bone border-2 border-bone shadow-xerox-sm transition-colors"
                  title="Quitar filtro"
                >
                  #{t}
                  <span className="opacity-50 group-hover:opacity-100">×</span>
                </button>
              ))}
              <button
                onClick={() => onNavigate({ type: 'tags' })}
                className="border-2 border-dashed border-bone px-3 py-1 font-mono text-xs tracking-wide text-bone-dim hover:bg-bone hover:text-ink transition-colors"
              >
                Todas las etiquetas
              </button>
            </div>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <p className="stamp px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] askew-1">
              No se encontraron poemas
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-bone">
            {filteredPosts.map((post, index) => (
              <article
                key={post.id}
                className="poem-card drift-in px-6 py-12 md:px-16 md:py-20 flex flex-col items-center"
              >
                <div className="w-full max-w-[38rem]">
                  <div className="flex items-baseline justify-between gap-4 mb-6">
                    <span className="font-mono text-[10px] tracking-[0.25em] text-bone-faint border-2 border-bone px-2 py-1">
                      {formatDate(post.published)}
                    </span>
                    <button
                      onClick={() => openReader(index)}
                      className="stamp px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] hover:bg-ink hover:text-bone border-2 border-bone transition-colors shrink-0"
                      title="Abrir en el lector"
                    >
                      Leer &rarr;
                    </button>
                  </div>

                  <h2
                    onClick={() => openReader(index)}
                    className="font-serif text-3xl md:text-4xl italic tracking-tight mb-8 leading-tight cursor-pointer text-bone hover:text-bone-dim transition-colors"
                  >
                    {post.title}
                  </h2>

                  <PoemContent
                    content={post.content}
                    tags={post.tags}
                    onTagClick={toggleTag}
                    className="poem-content font-serif text-lg md:text-xl leading-relaxed md:leading-loose"
                  />

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t-2 border-bone">
                      {post.tags.map((t) => (
                        <button
                          key={t}
                          onClick={() => toggleTag(t)}
                          className={`font-mono text-xs tracking-wide px-2 py-1 border-2 border-bone transition-colors ${
                            selectedTags.includes(t)
                              ? 'bg-bone text-ink shadow-xerox-sm'
                              : 'text-bone-dim hover:bg-bone hover:text-ink'
                          }`}
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
