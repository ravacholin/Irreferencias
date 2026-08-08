import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BloggerPost, ViewState } from '../types';

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
    <div className="flex flex-col h-full bg-gray-100 text-black">
      <header className="border-b-[4px] border-black bg-black text-white shrink-0">
        <div className="p-6 md:p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="text-xs font-mono uppercase font-bold tracking-widest opacity-70 hover:opacity-100 flex items-center gap-1"
            >
              &larr; Inicio
            </button>
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest bg-white text-black px-3 py-1 font-bold">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'poema' : 'poemas'}
            </span>
          </div>

          <input
            type="text"
            placeholder="BUSCAR EN TÍTULO Y TEXTO..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
            }}
            className="w-full border-[4px] border-white bg-black text-white p-3 md:p-4 font-bold uppercase tracking-widest outline-none focus:bg-white focus:text-black transition-colors placeholder:text-white/40"
          />

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedTags.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className="group border-[2px] border-white bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                  title="Quitar filtro"
                >
                  #{t}
                  <span className="opacity-50 group-hover:opacity-100">×</span>
                </button>
              ))}
              <button
                onClick={() => onNavigate({ type: 'tags' })}
                className="border-[2px] border-dashed border-white px-3 py-1 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
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
            <p className="text-center opacity-50 font-bold uppercase tracking-widest">
              No se encontraron poemas
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredPosts.map((post, index) => (
              <article
                key={post.id}
                className="poem-card border-b-[6px] border-black bg-white px-6 py-10 md:px-16 md:py-16 flex flex-col items-center"
              >
                <div className="w-full max-w-2xl">
                  <div className="flex items-baseline justify-between gap-4 mb-6">
                    <span className="font-mono text-[10px] md:text-xs opacity-40 uppercase tracking-widest">
                      {formatDate(post.published)}
                    </span>
                    <button
                      onClick={() => openReader(index)}
                      className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest border-b-2 border-black hover:bg-black hover:text-white px-1 transition-colors shrink-0"
                      title="Abrir en el lector"
                    >
                      Leer &rarr;
                    </button>
                  </div>

                  <h2
                    onClick={() => openReader(index)}
                    className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-8 leading-[0.9] cursor-pointer hover:opacity-60 transition-opacity"
                  >
                    {post.title}
                  </h2>

                  <div
                    className="poem-content font-serif text-lg md:text-2xl leading-relaxed md:leading-loose tracking-wide"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-10 pt-6 border-t-[3px] border-black">
                      {post.tags.map((t) => (
                        <button
                          key={t}
                          onClick={() => toggleTag(t)}
                          className={`font-mono text-xs md:text-sm font-bold border-b-2 pb-0.5 px-1 uppercase transition-colors ${
                            selectedTags.includes(t)
                              ? 'bg-black text-white border-black'
                              : 'border-black hover:bg-black hover:text-white'
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
