export type Todo = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type TodoPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Todo[];
};

export type TodoFilter = "all" | "active" | "completed";

