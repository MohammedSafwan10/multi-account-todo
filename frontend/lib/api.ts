import type { Todo, TodoFilter, TodoPage } from "@/types/todo";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.detail || body?.title?.[0] || "The request did not work.";
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export async function getTodos(filter: TodoFilter, search: string): Promise<TodoPage> {
  const params = new URLSearchParams();
  if (filter !== "all") {
    params.set("completed", String(filter === "completed"));
  }
  if (search.trim()) {
    params.set("search", search.trim());
  }
  const query = params.size ? `?${params.toString()}` : "";
  const response = await request<Todo[] | TodoPage>(`/api/todos${query}`);
  if (Array.isArray(response)) {
    return { count: response.length, next: null, previous: null, results: response };
  }
  return response;
}

export function createTodo(data: Pick<Todo, "title" | "description">): Promise<Todo> {
  return request<Todo>("/api/todos", { method: "POST", body: JSON.stringify(data) });
}

export function updateTodo(id: number, data: Partial<Pick<Todo, "title" | "description" | "completed">>) {
  return request<Todo>(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteTodo(id: number) {
  return request<void>(`/api/todos/${id}`, { method: "DELETE" });
}
