import { useState, useEffect } from 'react';
import { BloggerPost } from './types';
import postsData from './data.json';

export function usePosts() {
  const [posts, setPosts] = useState<BloggerPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate slight loading just in case components expect it, 
    // or just load immediately
    setPosts(postsData as BloggerPost[]);
    setLoading(false);
  }, []);

  return { posts, loading, error: null };
}
