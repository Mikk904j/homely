
export interface ShoppingList {
  id: string;
  name: string;
  status: 'active' | 'completed';
  created_at: string;
  created_by: string | null;
  assignee_id: string | null;
  updated_at: string | null;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  completed: boolean;
  list_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}
