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
                    onClick={() => onNavigate({ type: 'list', tag })}
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
            <ul className="flex flex-col gap-0 border-[4px] border-black bg-white">
              {filteredPosts.map((post) => {
                const globalIndex = posts.findIndex(p => p.id === post.id);
                const date = new Date(post.published);
                const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                return (
                  <li key={post.id} className="border-b-[4px] border-black last:border-b-0">
                    <button
                      onClick={() => onNavigate({ type: 'reader', postIndex: globalIndex, posts })}
                      className="w-full text-left p-6 md:p-8 hover:bg-black hover:text-white transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between group"
                    >
                      <div className="flex flex-col pr-4">
                        <span className="font-mono text-[10px] md:text-xs mb-2 opacity-50 group-hover:opacity-100 tracking-widest">
                          {dateStr}
                        </span>
                        <span className="text-2xl md:text-4xl font-bold tracking-tight uppercase leading-tight">
                          {post.title}
                        </span>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="hidden md:flex gap-2 mt-4 md:mt-0 opacity-50 group-hover:opacity-100">
                          {post.tags.slice(0, 3).map(t => (
                            <span key={t} className="border border-current px-2 py-1 text-[10px] font-bold uppercase">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
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
