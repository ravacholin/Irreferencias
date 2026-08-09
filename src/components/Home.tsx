import React from 'react';
import { BloggerPost, ViewState } from '../types';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  posts: BloggerPost[];
}

interface EntryProps {
  index: string;
  kicker: string;
  title: React.ReactNode;
  onClick: () => void;
  skew: string;
}

function Entry({ index, kicker, title, onClick, skew }: EntryProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col justify-between gap-16 p-8 md:p-10 text-left bg-ink border-2 border-bone hover:bg-bone hover:text-ink transition-colors duration-150 min-h-[240px] md:min-h-[300px] shadow-xerox hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] ${skew} hover:rotate-0`}
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone-dim group-hover:text-ink transition-colors">
          {kicker}
        </span>
        <span className="stamp group-hover:bg-ink group-hover:text-bone px-2 py-1 font-block text-base leading-none transition-colors">
          {index}
        </span>
      </div>
      <span className="font-display text-5xl md:text-6xl uppercase tracking-tight leading-[0.82]">
        {title}
      </span>
    </button>
  );
}

export function Home({ onNavigate, posts }: HomeProps) {
  return (
    <div className="flex flex-col h-full bg-ink text-bone">
      <header className="relative border-b-2 border-bone px-6 py-10 md:px-12 md:py-14 shrink-0 overflow-hidden">
        <div className="halftone absolute inset-x-0 top-0 h-3 opacity-40" aria-hidden="true" />
        <div className="flex items-center gap-3 flex-wrap">
          <span className="stamp px-3 py-1 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em]">
            Archivo de poesía
          </span>
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-bone-dim border-2 border-bone px-3 py-1">
            {posts.length} poemas
          </span>
        </div>
        <h1 className="ink-bleed mt-6 font-display text-[3.75rem] leading-[0.78] md:text-[8rem] lg:text-[10rem] uppercase tracking-tight">
          Irreferencias
        </h1>
        <div className="halftone-dense absolute -bottom-6 -right-4 w-40 h-24 opacity-20 rotate-6" aria-hidden="true" />
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:gap-8 md:p-10">
          <Entry
            index="01"
            kicker="Índice completo"
            title={<>Todos<br />los poemas</>}
            skew="askew-1"
            onClick={() => onNavigate({ type: 'list' })}
          />
          <Entry
            index="02"
            kicker="Descubrir"
            title={<span className="italic font-serif normal-case">Al azar</span>}
            skew="askew-2"
            onClick={() => {
              if (posts.length > 0) {
                onNavigate({
                  type: 'reader',
                  postIndex: Math.floor(Math.random() * posts.length),
                  posts,
                });
              }
            }}
          />
          <Entry
            index="03"
            kicker="Explorar por tema"
            title={<>Etiquetas<br />&amp; hashtags</>}
            skew="askew-3"
            onClick={() => onNavigate({ type: 'tags' })}
          />
        </div>
      </main>

      <footer className="border-t-2 border-bone px-6 py-4 md:px-12 flex items-center justify-between shrink-0 bg-ink">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-faint">
          Ed. 1.0 · fotocopiado
        </span>
        <span className="stamp px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] askew-2">
          Para mi hijo.
        </span>
      </footer>
    </div>
  );
}
