import React, { useState, useMemo } from 'react';
import { BloggerPost, ViewState } from '../types';

interface ListProps {
  posts: BloggerPost[];
  tag?: string;
  onNavigate: (view: ViewState) => void;
}

export function List({ posts, tag: initialTag, onNavigate }: ListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [posts]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags = selectedTags.length === 0 || selectedTags.every(t => p.tags.includes(t));
      return matchesSearch && matchesTags;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.published).getTime();
      const dateB = new Date(b.published).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [posts, searchTerm, selectedTags, sortOrder]);

  return (
    <div className="flex flex-col h-full bg-gray-100 text-black">
      <header className="border-b-[4px] border-black p-6 md:p-8 flex flex-col bg-black text-white shrink-0">
        <button 
          onClick={() => onNavigate({ type: 'home' })}
          className="self-start mb-6 text-xs font-mono uppercase font-bold tracking-widest opacity-70 hover:opacity-100 flex items-center gap-1"
        >
          &larr; Volver al inicio
        </button>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Índice
          </h2>
          <span className="font-mono text-sm uppercase tracking-widest bg-white text-black px-3 py-1 font-bold self-start md:self-auto">
            {filteredPosts.length} resultados
          </span>
        </div>
      </header>

      <div className="border-b-[4px] border-black bg-white p-6 md:p-8 flex flex-col gap-6 shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="BUSCAR POR TÍTULO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-[4px] border-black p-4 font-bold uppercase tracking-widest outline-none focus:bg-black focus:text-white transition-colors"
          />
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="border-[4px] border-black p-4 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors font-mono"
          >
            FECHA: {sortOrder === 'desc' ? 'MÁS RECIENTES' : 'MÁS ANTIGUOS'}
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-50">Filtrar por etiquetas:</span>
          <div className="flex flex-wrap gap-2">
            {allTags.map(t => {
              const isSelected = selectedTags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`border-[2px] border-black px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors ${
                    isSelected ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-gray-200'
                  }`}
                >
                  #{t}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="border-[2px] border-dashed border-black px-3 py-1 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                LIMPIAR FILTROS
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-0">
          {filteredPosts.map((post, index) => {
            const date = new Date(post.published);
            const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
            return (
              <li key={post.id} className="border-b-[2px] md:border-b-[4px] border-black last:border-b-0">
                <button
                  onClick={() => onNavigate({ type: 'reader', postIndex: index, posts: filteredPosts })}
                  className="w-full text-left p-6 md:p-8 bg-white hover:bg-black hover:text-white transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between group"
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
    </div>
  );
}
