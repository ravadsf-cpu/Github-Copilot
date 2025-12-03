export type Lean = 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';

export interface VideoMedia {
  kind?: 'iframe' | 'video';
  src?: string;
  type?: string;
  thumbnail?: string;
}

export interface Article {
  id?: string;
  url: string;
  urlToImage?: string;
  image?: string;
  title: string;
  summary?: string;
  description?: string;
  content?: string;
  contentHtml?: string;
  source?: string | { name: string };
  publishedAt?: string;
  lean?: Lean;
  leanScore?: number;
  leanReasons?: string[];
  media?: { images?: { src: string }[]; videos?: VideoMedia[] };
}

export interface Short extends Article {}
