export interface Comment {
  id?: string; 
  article_id: string; 
  user_id: string;
  author_username: string;
  content: string;
  created_at?: string;
}