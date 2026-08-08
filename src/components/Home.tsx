import React from 'react';
import { BloggerPost, ViewState } from '../types';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  posts: BloggerPost[];
}

export function Home({ onNavigate, posts }: HomeProps) {
  return (
    <div className="flex flex-col h-full bg-white text-black">
      <header className="border-b-[4px] border-black p-8 flex flex-col md:flex-row md:justify-between md:items-end bg-black text-white shrink-0">
        <div className="flex flex-col">
          <span className="text-xs font-mono tracking-widest opacity-70 uppercase mb-2">Archivo de Poesía — {posts.length} Poemas</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">IRREFERENCIAS</h1>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 bg-gray-100 overflow-y-auto">
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
          <button
            onClick={() => onNavigate({ type: 'list' })}
            className="group relative flex flex-col justify-between p-8 md:p-12 border-b-[4px] md:border-b-0 md:border-r-[4px] border-black bg-white hover:bg-black hover:text-white transition-colors duration-200 min-h-[250px]"
          >
            <span className="text-xs font-mono uppercase font-bold tracking-widest opacity-50 group-hover:opacity-100 mb-8">Índice Completo</span>
            <span className="text-4xl md:text-6xl font-black uppercase tracking-tight text-left leading-none">Todos<br/>los<br/>poemas</span>
          </button>
          
          <button
            onClick={() => {
              if (posts.length > 0) {
                onNavigate({ type: 'reader', postIndex: Math.floor(Math.random() * posts.length), posts });
              }
            }}
            className="group relative flex flex-col justify-between p-8 md:p-12 border-b-[4px] md:border-b-0 md:border-r-[4px] border-black bg-gray-50 hover:bg-black hover:text-white transition-colors duration-200 min-h-[250px]"
          >
            <span className="text-xs font-mono uppercase font-bold tracking-widest opacity-50 group-hover:opacity-100 mb-8">Descubrir</span>
            <span className="text-4xl md:text-6xl font-black uppercase tracking-tight text-left leading-none italic">Aleatorio</span>
          </button>

          <button
            onClick={() => onNavigate({ type: 'tags' })}
            className="group relative flex flex-col justify-between p-8 md:p-12 bg-white hover:bg-black hover:text-white transition-colors duration-200 min-h-[250px]"
          >
            <span className="text-xs font-mono uppercase font-bold tracking-widest opacity-50 group-hover:opacity-100 mb-8">Explorar por tema</span>
            <span className="text-4xl md:text-6xl font-black uppercase tracking-tight text-left leading-none">Etiquetas<br/>&amp;<br/>Hashtags</span>
          </button>
        </div>
      </main>
      
      <footer className="border-t-[4px] border-black bg-white text-black p-4 flex justify-between items-center shrink-0">
        <span className="text-xs font-mono uppercase font-bold tracking-widest">V 1.0</span>
        <span className="text-sm font-bold uppercase tracking-widest bg-black text-white px-4 py-1">Para mi hijo.</span>
      </footer>
    </div>
  );
}
