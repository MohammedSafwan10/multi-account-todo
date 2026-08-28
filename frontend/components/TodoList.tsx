import type { Todo } from "@/types/todo";

import TodoItem from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  busyId: number | null;
  onDelete: (todo: Todo) => void;
  onUpdate: (id: number, changes: Partial<Todo>) => Promise<boolean>;
};

export default function TodoList({ todos, busyId, onDelete, onUpdate }: TodoListProps) {
  if (!todos.length) {
    return (
      <div className="empty-state">
        <div className="empty-check">✓</div>
        <h2>No tasks here</h2>
        <p>Add a task above or choose a different filter.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {todos.map((todo) => (
        <TodoItem
          busy={busyId === todo.id}
          key={todo.id}
          onDelete={onDelete}
          onUpdate={onUpdate}
          todo={todo}
        />
      ))}
    </div>
  );
}

