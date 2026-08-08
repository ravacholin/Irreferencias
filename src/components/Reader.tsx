import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BloggerPost, ViewState } from '../types';

interface ReaderProps {
  postIndex: number;
  posts: BloggerPost[];
  onNavigate: (view: ViewState) => void;
  contextLabel?: string;
}

export function Reader({ postIndex, posts, onNavigate, contextLabel }: ReaderProps) {
  const post = posts[postIndex];
  const scrollRef = useRef<HTMLElement>(null);
  const directionRef = useRef(1);

  const canPrev = postIndex > 0;
  const canNext = postIndex < posts.length - 1;

  const go = (nextIndex: number) => {
    directionRef.current = nextIndex > postIndex ? 1 : -1;
    onNavigate({ type: 'reader', postIndex: nextIndex, posts, contextLabel });
  };

  const handlePrev = () => {
    if (canPrev) go(postIndex - 1);
  };

  const handleNext = () => {
    if (canNext) go(postIndex + 1);
  };

  const handleRandom = () => {
    if (posts.length <= 1) return;
    let randomIndex = postIndex;
    while (randomIndex === postIndex) {
      randomIndex = Math.floor(Math.random() * posts.length);
    }
    directionRef.current = randomIndex > postIndex ? 1 : -1;
    onNavigate({ type: 'reader', postIndex: randomIndex, posts, contextLabel });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [postIndex]);

  // Navegación con el teclado (← / →).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowLeft' && canPrev) {
        e.preventDefault();
        go(postIndex - 1);
      } else if (e.key === 'ArrowRight' && canNext) {
        e.preventDefault();
        go(postIndex + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postIndex, posts, canPrev, canNext]);

  if (!post) return null;

  const dir = directionRef.current;

  return (
    <div className="flex flex-col h-full bg-white text-black relative">
      <header className="border-b-[4px] border-black flex justify-between bg-black text-white shrink-0">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="p-4 md:p-6 border-r-[4px] border-black hover:bg-white hover:text-black transition-colors font-mono font-bold uppercase tracking-widest text-xs flex items-center"
        >
          &larr; Inicio
        </button>

        <div className="flex-1 flex items-center justify-center px-2 text-center min-w-0">
          <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">
            {postIndex + 1} / {posts.length}
            {contextLabel ? <span className="opacity-50"> · {contextLabel}</span> : null}
          </span>
        </div>

        <div className="flex shrink-0">
          <button
            onClick={handlePrev}
            disabled={!canPrev}
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
            disabled={!canNext}
            className="p-4 md:p-6 border-l-[4px] border-black hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-white font-mono font-bold uppercase text-xs md:text-base"
          >
            Sig &rarr;
          </button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={postIndex}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              const swipe = info.offset.x;
              const velocity = info.velocity.x;
              if ((swipe < -80 || velocity < -400) && canNext) {
                handleNext();
              } else if ((swipe > 80 || velocity > 400) && canPrev) {
                handlePrev();
              }
            }}
            className="reader-swipe p-8 md:p-16 lg:p-24 flex flex-col items-center min-h-full"
          >
            <div className="absolute top-6 left-6 font-mono text-[10px] md:text-xs opacity-30 uppercase tracking-widest hidden md:block pointer-events-none">
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

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-4 pt-12 border-t-[4px] border-black">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onNavigate({ type: 'results', tag })}
                      className="font-mono text-sm font-bold border-b-2 border-black pb-1 hover:bg-black hover:text-white transition-colors uppercase px-1"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </article>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
