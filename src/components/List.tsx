import React, { useMemo, useRef, useState } from 'react';
import { BloggerPost, ViewState } from '../types';

interface ListProps {
  posts: BloggerPost[];
  tag?: string;
  onNavigate: (view: ViewState) => void;
}

type SortMode = 'date' | 'alpha';
type SortDir = 'desc' | 'asc';

function formatDate(published: string): string {
  const d = new Date(published);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()}`;
}

function yearOf(published: string): string {
  return new Date(published).getFullYear().toString();
}

// Algunos poemas llegaron de Blogger sin título ("(null)"). Se muestran con
// un rótulo neutro en lugar del texto crudo.
function displayTitle(title: string): string {
  const t = (title ?? '').trim();
  if (!t || t.toLowerCase() === '(null)') return 'Sin título';
  return t;
}

// Primera letra normalizada (sin tildes) para agrupar el orden alfabético.
// Todo lo que no sea A–Z (números, comillas, símbolos) cae en "#".
function letterOf(title: string): string {
  const c = displayTitle(title)
    .trim()
    .charAt(0)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return /[A-Z]/.test(c) ? c : '#';
}

export function List({ posts, tag: initialTag, onNavigate }: ListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | undefined>(initialTag);
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const scrollRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isFiltering = searchTerm.trim().length > 0 || Boolean(activeTag);

  // Lista plana ya filtrada y ordenada. El índice de cada poema en ESTE
  // arreglo es el que recibe el lector (postIndex), así que se preserva.
  const filteredPosts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const result = posts.filter((p) => {
      const matchesSearch = !q || p.title.toLowerCase().includes(q);
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });

    result.sort((a, b) => {
      if (sortMode === 'date') {
        const diff = new Date(a.published).getTime() - new Date(b.published).getTime();
        return sortDir === 'desc' ? -diff : diff;
      }
      const cmp = a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [posts, searchTerm, activeTag, sortMode, sortDir]);

  // Agrupación para las cabeceras sticky y la barra de salto. Como la lista
  // ya viene ordenada, las claves aparecen en el orden correcto.
  const groups = useMemo(() => {
    const map = new Map<string, { post: BloggerPost; index: number }[]>();
    filteredPosts.forEach((post, index) => {
      const key = sortMode === 'date' ? yearOf(post.published) : letterOf(post.title);
      const bucket = map.get(key);
      if (bucket) bucket.push({ post, index });
      else map.set(key, [{ post, index }]);
    });
    return Array.from(map.entries());
  }, [filteredPosts, sortMode]);

  const handleSort = (mode: SortMode) => {
    if (sortMode === mode) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortMode(mode);
      setSortDir(mode === 'date' ? 'desc' : 'asc');
    }
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const jumpTo = (key: string) => {
    const container = scrollRef.current;
    const target = anchorRefs.current[key];
    if (!container || !target) return;
    const top =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  };

  const dateArrow = sortMode === 'date' ? (sortDir === 'desc' ? '↓' : '↑') : '';
  const alphaLabel = sortMode === 'alpha' && sortDir === 'desc' ? 'Z–A' : 'A–Z';

  return (
    <div className="flex flex-col h-full bg-ink text-bone">
      {/* ---- Cabecera ---- */}
      <header className="relative border-b-[3px] border-bone px-5 py-5 md:px-12 md:py-8 shrink-0 overflow-hidden">
        <div className="hazard absolute inset-x-0 top-0 h-2 opacity-70" aria-hidden="true" />
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="mb-4 stamp inline-block px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-ink hover:text-bone border-2 border-bone transition-colors askew-1"
            >
              &larr; Inicio
            </button>
            <h2 className="ink-bleed misprint xerox-rough font-display text-[2.75rem] md:text-8xl uppercase tracking-tight leading-[0.82]">
              Índice
            </h2>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-faint">
              Todos los poemas
            </p>
          </div>
          <span className="shrink-0 self-start font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim border-2 border-bone px-3 py-1 whitespace-nowrap">
            {isFiltering
              ? `${filteredPosts.length} / ${posts.length}`
              : `${posts.length} poemas`}
          </span>
        </div>
      </header>

      {/* ---- Controles: buscar + ordenar ---- */}
      <div className="border-b-[3px] border-bone px-5 py-3 md:px-12 md:py-4 flex flex-col gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por título…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                scrollRef.current?.scrollTo({ top: 0 });
              }}
              className="w-full border-2 border-bone bg-ink pl-4 pr-9 py-3 font-mono text-sm text-bone placeholder:text-bone-faint outline-none focus:shadow-xerox-sm transition-shadow"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 font-mono text-sm text-bone-dim hover:bg-bone hover:text-ink transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleSort('date')}
              title="Ordenar por fecha"
              className={`flex-1 sm:flex-none border-2 border-bone px-3 py-3 font-mono text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${
                sortMode === 'date'
                  ? 'bg-bone text-ink shadow-xerox-sm'
                  : 'bg-ink text-bone-dim hover:bg-bone hover:text-ink'
              }`}
            >
              Fecha {dateArrow}
            </button>
            <button
              onClick={() => handleSort('alpha')}
              title="Ordenar alfabéticamente"
              className={`flex-1 sm:flex-none border-2 border-bone px-3 py-3 font-mono text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${
                sortMode === 'alpha'
                  ? 'bg-bone text-ink shadow-xerox-sm'
                  : 'bg-ink text-bone-dim hover:bg-bone hover:text-ink'
              }`}
            >
              {alphaLabel}
            </button>
          </div>
        </div>

        {activeTag && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-faint">
              Filtrando
            </span>
            <button
              onClick={() => setActiveTag(undefined)}
              className="group flex items-center gap-2 bg-bone text-ink px-3 py-1 font-mono text-xs tracking-wide border-2 border-bone shadow-xerox-sm hover:bg-ink hover:text-bone transition-colors"
              title="Quitar filtro"
            >
              #{activeTag}
              <span className="opacity-60 group-hover:opacity-100">✕</span>
            </button>
            <button
              onClick={() => onNavigate({ type: 'tags' })}
              className="border-2 border-dashed border-bone px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-dim hover:bg-bone hover:text-ink transition-colors"
            >
              Todas las etiquetas &rarr;
            </button>
          </div>
        )}
      </div>

      {/* ---- Barra de salto (por año o por letra) ---- */}
      {groups.length > 1 && (
        <div className="border-b-[3px] border-bone px-5 py-2.5 md:px-12 flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.3em] text-bone-faint shrink-0">
            Saltar a
          </span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {groups.map(([key, items]) => (
              <button
                key={key}
                onClick={() => jumpTo(key)}
                title={`${items.length} ${items.length === 1 ? 'poema' : 'poemas'}`}
                className="shrink-0 border-2 border-bone bg-ink px-2.5 py-1 font-mono text-[11px] tracking-wide text-bone-dim hover:bg-bone hover:text-ink transition-colors"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Listado agrupado ---- */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-5 p-8 text-center">
            <span className="stamp px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] askew-1">
              Nada coincide
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTag(undefined);
              }}
              className="border-2 border-bone px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-dim hover:bg-bone hover:text-ink transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          groups.map(([key, items]) => (
            <section key={key}>
              <div
                ref={(el) => {
                  anchorRefs.current[key] = el;
                }}
                className="sticky top-0 z-10 bg-ink border-y-[3px] border-bone first:border-t-0"
              >
                <div className="flex items-baseline justify-between px-5 py-2 md:px-12">
                  <span className="font-display text-2xl md:text-4xl uppercase tracking-tight leading-none ink-bleed">
                    {key}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-faint">
                    {items.length} {items.length === 1 ? 'poema' : 'poemas'}
                  </span>
                </div>
              </div>

              <ul>
                {items.map(({ post, index }) => (
                  <li
                    key={post.id}
                    className="group border-b-[3px] border-bone hover:bg-bone hover:text-ink transition-colors duration-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-4 md:px-12 md:py-5">
                      <button
                        onClick={() =>
                          onNavigate({ type: 'reader', postIndex: index, posts: filteredPosts })
                        }
                        className="text-left flex-1 min-w-0 flex items-baseline gap-3 md:gap-5"
                      >
                        <span className="font-block text-sm md:text-base text-bone-faint group-hover:text-ink/60 transition-colors shrink-0 w-8 md:w-10 tabular-nums">
                          {(index + 1).toString().padStart(3, '0')}
                        </span>
                        <span className="flex flex-col gap-1 min-w-0">
                          <span className="font-mono text-[10px] tracking-[0.25em] text-bone-faint group-hover:text-ink/60 transition-colors">
                            {formatDate(post.published)}
                          </span>
                          <span className="font-serif text-xl md:text-2xl italic tracking-tight leading-snug break-words">
                            {displayTitle(post.title)}
                          </span>
                        </span>
                      </button>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-11 sm:pl-0 sm:justify-end sm:max-w-[42%] shrink-0">
                          {post.tags.slice(0, 3).map((t) => (
                            <button
                              key={t}
                              onClick={() => onNavigate({ type: 'results', tag: t })}
                              className="border-2 border-bone px-2 py-0.5 font-mono text-[10px] text-bone-dim group-hover:border-ink group-hover:text-ink hover:!bg-bone hover:!text-ink transition-colors"
                              title={`Ver poemas de #${t}`}
                            >
                              #{t}
                            </button>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-1 py-0.5 font-mono text-[10px] text-bone-faint group-hover:text-ink/60 self-center">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
