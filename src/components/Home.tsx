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

// Ransom-note: cada letra recortada de una revista distinta. Fuentes,
// tamaños y ángulos mezclados, con fondo alternado negro/papel.
const RANSOM_FACES = ['font-display', 'font-block', 'font-serif italic', 'font-mono'];
const RANSOM_SKEW = [-5, 4, -3, 6, -2, 5, -6, 3, -4, 2, -5, 4, 3, -3];

function Ransom({ text }: { text: string }) {
  return (
    <span className="inline-flex flex-wrap" aria-label={text}>
      {text.split('').map((ch, i) => {
        const face = RANSOM_FACES[i % RANSOM_FACES.length];
        const inverted = i % 3 === 0;
        const rot = RANSOM_SKEW[i % RANSOM_SKEW.length];
        return (
          <span
            key={i}
            aria-hidden="true"
            className={`${face} ${inverted ? 'stamp' : 'bg-ink text-bone'} inline-block px-[0.06em] leading-[0.85] border-2 border-bone`}
            style={{
              transform: `rotate(${rot}deg)`,
              marginLeft: i === 0 ? 0 : '-0.02em',
              marginBottom: i % 2 ? '0.06em' : 0,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}

function Entry({ index, kicker, title, onClick, skew }: EntryProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col justify-between gap-16 p-8 md:p-10 text-left bg-ink border-[3px] border-bone hover:bg-bone hover:text-ink transition-colors duration-100 min-h-[240px] md:min-h-[300px] shadow-xerox hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] ${skew} hover:rotate-0`}
    >
      {/* trama de medios tonos que asoma en la esquina */}
      <div className="halftone-dense absolute inset-x-0 bottom-0 h-10 opacity-15 group-hover:opacity-0 transition-opacity pointer-events-none" aria-hidden="true" />
      <div className="flex items-start justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone-dim group-hover:text-ink transition-colors">
          {kicker}
        </span>
        <span className="stamp group-hover:bg-ink group-hover:text-bone px-2 py-1 font-block text-lg leading-none transition-colors border-2 border-bone">
          {index}
        </span>
      </div>
      <span className="font-display text-5xl md:text-6xl uppercase tracking-tight leading-[0.82] ink-bleed">
        {title}
      </span>
    </button>
  );
}

export function Home({ onNavigate, posts }: HomeProps) {
  return (
    <div className="flex flex-col h-full bg-ink text-bone">
      <header className="relative border-b-[3px] border-bone px-6 py-10 md:px-12 md:py-14 shrink-0 overflow-hidden">
        {/* franja de peligro arriba */}
        <div className="hazard absolute inset-x-0 top-0 h-2.5 opacity-80" aria-hidden="true" />
        <div className="halftone absolute inset-x-0 top-2.5 h-4 opacity-25" aria-hidden="true" />

        <div className="flex items-center gap-3 flex-wrap mt-2">
          <span className="stamp px-3 py-1 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] askew-1 border-2 border-bone">
            Archivo de poesía
          </span>
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-bone-dim border-2 border-bone px-3 py-1 askew-2">
            {posts.length} poemas
          </span>
          <span className="hazard text-transparent select-none px-6 py-1 hidden md:inline-block askew-3" aria-hidden="true">
            xx
          </span>
        </div>

        <h1 className="misprint xerox-crush mt-8 text-[3.5rem] md:text-[7.5rem] lg:text-[9rem] uppercase leading-[0.78]">
          <Ransom text="IRREFERENCIAS" />
        </h1>

        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-bone-dim">
            Fotocopiado a mano · blanco y negro · nº 1
          </span>
          <span className="censor px-8 py-1 hidden md:inline-block askew-2" aria-hidden="true">
            xxxx
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:gap-10 md:p-12">
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

      <footer className="relative border-t-[3px] border-bone px-6 py-4 md:px-12 flex items-center justify-between shrink-0 bg-ink overflow-hidden">
        <div className="halftone absolute inset-x-0 bottom-0 h-2 opacity-30" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-faint">
          Ed. 1.0 · fotocopiado
        </span>
        <span className="stamp px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] askew-2 border-2 border-bone">
          Para mi hijo.
        </span>
      </footer>
    </div>
  );
}
