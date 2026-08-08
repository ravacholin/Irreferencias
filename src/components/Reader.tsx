import React, { useEffect, useRef } from 'react';
import { BloggerPost, ViewState } from '../types';

interface ReaderProps {
  postIndex: number;
  posts: BloggerPost[];
  onNavigate: (view: ViewState) => void;
}

export function Reader({ postIndex, posts, onNavigate }: ReaderProps) {
  const post = posts[postIndex];
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [postIndex]);

  if (!post) return null;

  const handlePrev = () => {
    if (postIndex > 0) onNavigate({ type: 'reader', postIndex: postIndex - 1, posts });
  };

  const handleNext = () => {
    if (postIndex < posts.length - 1) onNavigate({ type: 'reader', postIndex: postIndex + 1, posts });
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * posts.length);
    onNavigate({ type: 'reader', postIndex: randomIndex, posts });
  };

  return (
    <div className="flex flex-col h-full bg-white text-black relative">
      <header className="border-b-[4px] border-black flex justify-between bg-black text-white shrink-0">
        <button 
          onClick={() => onNavigate({ type: 'home' })}
          className="p-4 md:p-6 border-r-[4px] border-black hover:bg-white hover:text-black transition-colors font-mono font-bold uppercase tracking-widest text-xs flex items-center"
        >
          &larr; Inicio
        </button>
        <div className="flex">
          <button 
            onClick={handlePrev}
            disabled={postIndex === 0}
            className="p-4 md:p-6 border-l-[4px] border-black hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-white font-mono font-bold uppercase text-xs md:text-base"
          >
            &larr; Ant
          </button>
          <button 
            onClick={handleRandom}
            className="p-4 md:p-6 border-l-[4px] border-black hover:bg-white hover:text-black transition-colors font-mono font-bold uppercase hidden md:block"
          >
            Random
          </button>
          <button 
            onClick={handleNext}
            disabled={postIndex === posts.length - 1}
            className="p-4 md:p-6 border-l-[4px] border-black hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-white font-mono font-bold uppercase text-xs md:text-base"
          >
            Sig &rarr;
          </button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto p-8 md:p-16 lg:p-24 relative flex flex-col items-center">
        <div className="absolute top-6 left-6 font-mono text-[10px] md:text-xs opacity-30 uppercase tracking-widest hidden md:block">
          ID #{post.id.slice(-6)} // ARCHIVO
        </div>
        
        <article className="w-full max-w-2xl mt-8">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-12 leading-[0.85]">
            {post.title}
          </h1>
          
          <div 
            className="poem-content font-serif text-xl md:text-2xl leading-relaxed md:leading-loose tracking-wide mb-16"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="flex flex-wrap gap-4 pt-12 border-t-[4px] border-black">
            {post.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onNavigate({ type: 'list', tag })}
                className="font-mono text-sm font-bold border-b-2 border-black pb-1 hover:bg-black hover:text-white transition-colors uppercase px-1"
              >
                #{tag}
              </button>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
