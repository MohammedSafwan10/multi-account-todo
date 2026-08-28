import { FormEvent, useState } from "react";

type TodoFormProps = {
  onAdd: (title: string, description: string) => Promise<boolean>;
};

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || saving) return;

    setSaving(true);
    const saved = await onAdd(title.trim(), description.trim());
    setSaving(false);
    if (saved) {
      setTitle("");
      setDescription("");
    }
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="new-task-title">
        Task title
      </label>
      <input
        id="new-task-title"
        maxLength={200}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What needs to be done?"
        value={title}
      />
      <label className="sr-only" htmlFor="new-task-description">
        Description
      </label>
      <input
        id="new-task-description"
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Add a note (optional)"
        value={description}
      />
      <button className="primary-button" disabled={!title.trim() || saving} type="submit">
        {saving ? "Adding..." : "Add task"}
      </button>
    </form>
  );
}

