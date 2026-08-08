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

export default function App() {
  const { posts, loading, error } = usePosts();
  const [view, setView] = useState<ViewState>({ type: 'home' });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest animate-pulse">
          Cargando...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-600 text-white flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase mb-4">Error</h1>
          <p className="text-2xl font-bold font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased selection:bg-black selection:text-white h-screen p-0 md:p-6 bg-gray-200">
      <div className="border-0 md:border-[16px] border-black bg-white h-full flex flex-col overflow-hidden md:shadow-2xl">
        {view.type === 'home' && (
          <Home onNavigate={setView} posts={posts} />
        )}
        {view.type === 'list' && (
          <List posts={posts} tag={view.tag} onNavigate={setView} />
        )}
        {view.type === 'tags' && (
          <Tags posts={posts} onNavigate={setView} />
        )}
        {view.type === 'reader' && (
          <Reader postIndex={view.postIndex} posts={posts} onNavigate={setView} />
        )}
      </div>
    </div>
  );
}
