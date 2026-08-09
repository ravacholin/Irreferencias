/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ViewState } from './types';
import { usePosts } from './usePosts';
import { Home } from './components/Home';
import { List } from './components/List';
import { Reader } from './components/Reader';
import { Tags } from './components/Tags';
import { Results } from './components/Results';

export default function App() {
  const { posts, loading, error } = usePosts();
  const [view, setView] = useState<ViewState>({ type: 'home' });

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-bone flex items-center justify-center p-8">
        <span className="stamp px-5 py-2 font-mono text-xs uppercase tracking-[0.35em] animate-pulse askew-1">
          Cargando el archivo…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink text-bone flex items-center justify-center p-8">
        <div className="max-w-md text-center border-2 border-bone bg-ink p-10 shadow-xerox askew-2">
          <span className="stamp inline-block px-4 py-1 font-mono text-[10px] uppercase tracking-[0.35em]">
            Error
          </span>
          <p className="mt-6 font-mono text-base text-bone">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased h-screen p-0 md:p-6 bg-ink">
      <div className="border-0 md:border-[3px] border-bone bg-ink h-full flex flex-col overflow-hidden md:shadow-xerox-lg">
        {view.type === 'home' && (
          <Home onNavigate={setView} posts={posts} />
        )}
        {view.type === 'list' && (
          <List posts={posts} tag={view.tag} onNavigate={setView} />
        )}
        {view.type === 'results' && (
          <Results posts={posts} tag={view.tag} query={view.query} onNavigate={setView} />
        )}
        {view.type === 'tags' && (
          <Tags posts={posts} onNavigate={setView} />
        )}
        {view.type === 'reader' && (
          <Reader
            postIndex={view.postIndex}
            posts={view.posts.length > 0 ? view.posts : posts}
            contextLabel={view.contextLabel}
            onNavigate={setView}
          />
        )}
      </div>
    </div>
  );
}
