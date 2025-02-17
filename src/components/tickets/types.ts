
export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignee: string;
  created: string;
  comments: number;
}

export interface Comment {
  id: string;
  comment: string;
  time: string;
  user: string;
}

export interface CommentData {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
}
