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
    <div className="flex flex-col h-full bg-gray-50 text-black">
      <header className="border-b-[4px] border-black p-6 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between bg-black text-white shrink-0">
        <div className="flex flex-col">
          <button 
            onClick={() => onNavigate({ type: 'home' })}
            className="self-start mb-4 text-xs font-mono uppercase font-bold tracking-widest opacity-70 hover:opacity-100 flex items-center gap-1"
          >
            &larr; Volver al inicio
          </button>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Nube de Etiquetas
          </h2>
        </div>
      </header>

      <div className="border-b-[4px] border-black bg-white p-6 md:p-8 flex flex-col shrink-0">
        <input
          type="text"
          placeholder="BUSCAR ETIQUETAS O TEXTO EN POEMAS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-[4px] border-black p-4 font-bold uppercase tracking-widest outline-none focus:bg-black focus:text-white transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col">
        {filteredTags.length > 0 && (
          <div className="mb-12">
            {searchTerm && <h3 className="text-xl font-bold uppercase tracking-widest mb-6 border-b-4 border-black inline-block pb-1">Etiquetas ({filteredTags.length})</h3>}
            <div className="flex flex-wrap gap-x-6 gap-y-8 items-center max-w-5xl mx-auto">
              {filteredTags.map(([tag, count], index) => {
                const isLarge = !searchTerm && count > 5;
                const isMedium = !searchTerm && count > 2 && count <= 5;
                const isItalic = !searchTerm && index % 3 === 0;
                const isUnderline = !searchTerm && index % 5 === 0;
                const opacityClass = !searchTerm && count === 1 ? 'opacity-50 hover:opacity-100' : 'opacity-100';

                return (
                  <button
                    key={tag}
                    onClick={() => onNavigate({ type: 'results', tag })}
                    className={`group flex items-center uppercase transition-transform hover:-translate-y-1 ${opacityClass}`}
                  >
                    <span className={`
                      ${isLarge ? 'text-4xl md:text-6xl font-black tracking-tighter' : ''}
                      ${isMedium ? 'text-2xl md:text-4xl font-bold' : ''}
                      ${!isLarge && !isMedium ? 'text-lg md:text-xl font-bold' : ''}
                      ${isItalic ? 'italic' : ''}
                      ${isUnderline ? 'underline decoration-[3px] md:decoration-[4px]' : ''}
                    `}>
                      {tag}
                    </span>
                    <span className="ml-2 font-mono text-[10px] md:text-xs font-bold bg-black text-white px-1">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {searchTerm && filteredPosts.length > 0 && (
          <div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-6 border-b-4 border-black inline-block pb-1">Poemas ({filteredPosts.length})</h3>
            <button
              onClick={() => onNavigate({ type: 'results', query: searchTerm })}
              className="w-full border-[4px] border-black bg-white p-6 md:p-8 text-left hover:bg-black hover:text-white transition-colors duration-150 flex items-center justify-between gap-4 group"
            >
              <span className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-none">
                Leer {filteredPosts.length} {filteredPosts.length === 1 ? 'poema' : 'poemas'}
              </span>
              <span className="font-mono text-lg md:text-2xl font-bold shrink-0 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </div>
        )}

        {searchTerm && filteredTags.length === 0 && filteredPosts.length === 0 && (
          <div className="text-center mt-12 opacity-50 font-bold uppercase tracking-widest">
            No se encontraron resultados
          </div>
        )}
      </div>
    </div>
  );
}
