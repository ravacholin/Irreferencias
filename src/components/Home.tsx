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
}

function Entry({ index, kicker, title, onClick }: EntryProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col justify-between gap-16 p-8 md:p-12 text-left bg-ink hover:bg-bone hover:text-ink transition-colors duration-300 min-h-[240px] md:min-h-[300px]"
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim group-hover:text-ink/60 transition-colors">
          {kicker}
        </span>
        <span className="font-mono text-[10px] text-bone-faint group-hover:text-ink/40 transition-colors">
          {index}
        </span>
      </div>
      <span className="text-4xl md:text-5xl font-semibold tracking-tight leading-[0.95]">
        {title}
      </span>
    </button>
  );
}

export function Home({ onNavigate, posts }: HomeProps) {
  return (
    <div className="flex flex-col h-full bg-ink text-bone">
      <header className="border-b border-rule px-8 py-12 md:px-12 md:py-16 shrink-0">
        <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-bone-dim">
          Archivo de poesía · {posts.length} poemas
        </span>
        <h1 className="mt-5 text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight leading-[0.85]">
          Irreferencias
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-hairline">
          <Entry
            index="01"
            kicker="Índice completo"
            title={<>Todos<br />los poemas</>}
            onClick={() => onNavigate({ type: 'list' })}
          />
          <Entry
            index="02"
            kicker="Descubrir"
            title={<span className="italic font-serif font-normal">Al azar</span>}
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
            onClick={() => onNavigate({ type: 'tags' })}
          />
        </div>
      </main>

      <footer className="border-t border-rule px-8 py-5 md:px-12 flex items-center justify-between shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-faint">
          V 1.0
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim">
          Para mi hijo.
        </span>
      </footer>
    </div>
  );
}
