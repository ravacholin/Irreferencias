import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BloggerPost, ViewState } from '../types';
import { PoemContent } from './PoemContent';

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
  const lastScrollTop = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chrome (la barra superior) se retrae mientras se lee y reaparece
  // ante cualquier interacción: movimiento, toque o scroll hacia arriba.
  const [chromeHidden, setChromeHidden] = useState(false);

  const canPrev = postIndex > 0;
  const canNext = postIndex < posts.length - 1;

  const poke = useCallback(() => {
    setChromeHidden(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setChromeHidden(true), 2800);
  }, []);

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
    lastScrollTop.current = 0;
    poke();
  }, [postIndex, poke]);

  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // El scroll hacia abajo esconde la barra; hacia arriba (o cerca del
  // inicio) la revela.
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const top = el.scrollTop;
    if (top <= 4) {
      poke();
    } else if (top > lastScrollTop.current + 6) {
      setChromeHidden(true);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    } else if (top < lastScrollTop.current - 6) {
      poke();
    }
    lastScrollTop.current = top;
  };

  // Navegación con el teclado (← / →).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      poke();
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
    <div
      className="flex flex-col h-full bg-ink text-bone relative"
      onMouseMove={poke}
      onTouchStart={poke}
    >
      <header
        className={`chrome absolute top-0 inset-x-0 z-20 border-b-2 border-bone flex justify-between bg-bone text-ink ${
          chromeHidden ? 'chrome-hidden' : ''
        }`}
      >
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="px-4 py-4 md:px-6 border-r border-ink/30 hover:bg-ink hover:text-bone transition-colors font-mono text-[10px] uppercase tracking-[0.25em] flex items-center"
        >
          &larr; Inicio
        </button>

        <div className="flex-1 flex items-center justify-center px-2 text-center min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] truncate">
            {postIndex + 1} / {posts.length}
            {contextLabel ? <span className="opacity-60"> · {contextLabel}</span> : null}
          </span>
        </div>

        <div className="flex shrink-0">
          <button
            onClick={handlePrev}
            disabled={!canPrev}
            className="px-4 py-4 md:px-6 border-l border-ink/30 hover:bg-ink hover:text-bone transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ink font-mono text-[10px] uppercase tracking-[0.25em]"
          >
            &larr; Ant
          </button>
          <button
            onClick={handleRandom}
            className="px-4 py-4 md:px-6 border-l border-ink/30 hover:bg-ink hover:text-bone transition-colors font-mono text-[10px] uppercase tracking-[0.25em] hidden md:block"
          >
            Azar
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="px-4 py-4 md:px-6 border-l border-ink/30 hover:bg-ink hover:text-bone transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ink font-mono text-[10px] uppercase tracking-[0.25em]"
          >
            Sig &rarr;
          </button>
        </div>
      </header>

      <main ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={postIndex}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: dir * -40, filter: 'blur(4px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
            className="reader-swipe px-6 pt-28 pb-24 md:px-16 md:pt-32 md:pb-32 lg:px-24 flex flex-col items-center min-h-full"
          >
            <div className="absolute top-24 left-6 stamp px-2 py-1 font-mono text-[10px] tracking-[0.25em] uppercase hidden md:block pointer-events-none askew-1">
              ID #{post.id.slice(-6)} · archivo
            </div>

            <article className="w-full max-w-[38rem]">
              <h1 className="font-serif text-4xl md:text-6xl italic tracking-tight mb-12 leading-[1.05] text-bone">
                {post.title}
              </h1>

              <PoemContent
                content={post.content}
                tags={post.tags}
                onTagClick={(tag) => onNavigate({ type: 'results', tag })}
                className="poem-content font-serif text-xl md:text-2xl leading-relaxed md:leading-loose mb-16"
              />

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-10 border-t-2 border-bone">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onNavigate({ type: 'results', tag })}
                      className="font-mono text-xs tracking-wide px-2 py-1 border-2 border-bone text-bone-dim hover:bg-bone hover:text-ink transition-colors"
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
