import { FormEvent, useState } from "react";

import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  busy: boolean;
  onDelete: (todo: Todo) => void;
  onUpdate: (id: number, changes: Partial<Todo>) => Promise<boolean>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TodoItem({ todo, busy, onDelete, onUpdate }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    if (await onUpdate(todo.id, { title: title.trim(), description: description.trim() })) {
      setEditing(false);
    }
  }

  function cancel() {
    setTitle(todo.title);
    setDescription(todo.description);
    setEditing(false);
  }

  return (
    <article className={`task-row ${todo.completed ? "is-complete" : ""}`}>
      <button
        aria-label={todo.completed ? `Mark ${todo.title} as active` : `Mark ${todo.title} as complete`}
        className="complete-button"
        disabled={busy}
        onClick={() => onUpdate(todo.id, { completed: !todo.completed })}
        type="button"
      >
        {todo.completed && "✓"}
      </button>

      {editing ? (
        <form className="edit-form" onSubmit={save}>
          <input
            aria-label="Task title"
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
          <input
            aria-label="Task description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a note (optional)"
            value={description}
          />
          <div className="edit-actions">
            <button className="small-primary" disabled={busy || !title.trim()} type="submit">
              Save
            </button>
            <button disabled={busy} onClick={cancel} type="button">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="task-copy">
            <h2>{todo.title}</h2>
            {todo.description && <p>{todo.description}</p>}
          </div>
          <time dateTime={todo.updated_at}>{formatDate(todo.updated_at)}</time>
          <div className="task-actions">
            <button disabled={busy} onClick={() => setEditing(true)} type="button">
              Edit
            </button>
            <button className="delete-button" disabled={busy} onClick={() => onDelete(todo)} type="button">
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}

