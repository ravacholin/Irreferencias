export interface BloggerPost {
  id: string;
  title: string;
  content: string;
  published: string;
  tags: string[];
  link: string;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'list', tag?: string }
  | { type: 'reader', postIndex: number, posts: BloggerPost[] }
  | { type: 'tags' };
