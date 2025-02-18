
export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed';
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
