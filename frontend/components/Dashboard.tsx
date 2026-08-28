"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, createTodo, deleteTodo, getTodos, updateTodo } from "@/lib/api";
import type { Todo, TodoFilter } from "@/types/todo";

import ErrorMessage from "./ErrorMessage";
import ConfirmDialog from "./ConfirmDialog";
import LoadingState from "./LoadingState";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";

type DashboardProps = {
  name: string;
  email: string;
};

type Confirmation = { type: "delete"; todo: Todo } | { type: "logout" } | null;

function errorText(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === 401) return "Your session ended. Log in again.";
  if (error instanceof ApiError && error.status === 403) return "You do not have access to that task.";
  if (error instanceof ApiError && error.status === 404) return "That task is no longer here.";
  return fallback;
}

export default function Dashboard({ name, email }: DashboardProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const loadVersion = useRef(0);

  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true);
    setError("");
    try {
      const page = await getTodos(filter, search);
      if (version === loadVersion.current) {
        setTodos(page.results);
      }
    } catch (loadError) {
      if (version === loadVersion.current) {
        setError(errorText(loadError, "Could not load your tasks."));
      }
    } finally {
      if (version === loadVersion.current) {
        setLoading(false);
      }
    }
  }, [filter, search]);

  useEffect(() => {
    const timeout = window.setTimeout(load, 250);
    return () => window.clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function add(title: string, description: string) {
    setError("");
    try {
      await createTodo({ title, description });
      setNotice("Task added");
      await load();
      return true;
    } catch (saveError) {
      setError(errorText(saveError, "Could not add the task."));
      return false;
    }
  }

  async function update(id: number, changes: Partial<Todo>) {
    ++loadVersion.current;
    setBusyId(id);
    setError("");
    try {
      const saved = await updateTodo(id, changes);
      setTodos((current) => current.map((todo) => (todo.id === id ? saved : todo)));
      setNotice("Task saved");
      return true;
    } catch (saveError) {
      setError(errorText(saveError, "Could not save the task."));
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function remove(todo: Todo) {
    ++loadVersion.current;
    setBusyId(todo.id);
    setError("");
    try {
      await deleteTodo(todo.id);
      setTodos((current) => current.filter((item) => item.id !== todo.id));
      setNotice("Task deleted");
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.status === 404) {
        setTodos((current) => current.filter((item) => item.id !== todo.id));
        setNotice("Task was already deleted");
      } else {
        setError(errorText(deleteError, "Could not delete the task."));
      }
    } finally {
      setBusyId(null);
    }
  }

  function confirmLogout() {
    window.location.assign("/auth/logout");
  }

  const initials = (name || email || "U")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/dashboard">
          Todo List
        </a>
        <div className="account-menu">
          <span className="avatar">{initials}</span>
          <span className="account-name">{name || email}</span>
          <button className="logout-button" onClick={() => setConfirmation({ type: "logout" })} type="button">
            Log out
          </button>
        </div>
      </header>

      <section className="dashboard">
        <div className="page-heading">
          <div>
            <h1>My tasks</h1>
            <p>Keep track of what you need to do.</p>
          </div>
          {notice && (
            <div className="toast" role="status">
              <span>✓</span> {notice}
            </div>
          )}
        </div>

        <TodoForm onAdd={add} />

        <div className="list-tools">
          <div className="filters" aria-label="Task filters">
            {(["all", "active", "completed"] as TodoFilter[]).map((option) => (
              <button
                aria-pressed={filter === option}
                className={filter === option ? "selected" : ""}
                key={option}
                onClick={() => setFilter(option)}
                type="button"
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
          <label className="search-box">
            <span>⌕</span>
            <span className="sr-only">Search tasks</span>
            <input onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" value={search} />
          </label>
        </div>

        {error && <ErrorMessage message={error} onRetry={load} />}
        {loading ? (
          <LoadingState />
        ) : (
          <TodoList
            busyId={busyId}
            onDelete={(todo) => setConfirmation({ type: "delete", todo })}
            onUpdate={update}
            todos={todos}
          />
        )}
      </section>

      {confirmation?.type === "delete" && (
        <ConfirmDialog
          confirmLabel="Delete task"
          dangerous
          message={`This will permanently delete “${confirmation.todo.title}”.`}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            const { todo } = confirmation;
            setConfirmation(null);
            void remove(todo);
          }}
          title="Delete this task?"
        />
      )}

      {confirmation?.type === "logout" && (
        <ConfirmDialog
          confirmLabel="Log out"
          message="You can log back in whenever you need to."
          onCancel={() => setConfirmation(null)}
          onConfirm={confirmLogout}
          title="Log out of Todo List?"
        />
      )}
    </main>
  );
}
