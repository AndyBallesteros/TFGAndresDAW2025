export interface Article {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string | null;
  created_at?: string; 
  author_id?: string;
  author?: string;
}