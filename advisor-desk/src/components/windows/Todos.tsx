import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { usePersistedStore } from '../../hooks/usePersistedStore';
import type { TodoItem } from '../../types';

/**
 * Persistent to-do list. Items never expire or auto-clear — they only leave
 * the list when explicitly deleted (or via the confirmed "Clear completed").
 */
export function Todos() {
  const [todos, setTodos] = usePersistedStore<TodoItem[]>('todos', []);
  const [text, setText] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const sorted = [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const completedCount = todos.filter((t) => t.done).length;

  const addTodo = () => {
    const clean = text.trim();
    if (!clean) return;
    setTodos((prev) => [
      ...prev,
      {
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: clean,
        done: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setText('');
  };

  const toggle = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="flex h-full flex-col">
      <form
        className="flex shrink-0 items-center gap-2 border-b border-edge p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a to-do… (Enter to save)"
          aria-label="New to-do"
          className="min-w-0 flex-1 rounded-md border border-edge bg-desk px-2.5 py-1.5 text-[13px] text-slate-200 placeholder:text-slate-500 focus:border-brass"
        />
        <button
          type="submit"
          aria-label="Add to-do"
          className="flex shrink-0 items-center gap-1 rounded-md bg-brass px-2.5 py-1.5 text-[12px] font-semibold text-desk hover:bg-brass/90"
        >
          <Plus size={13} />
          Add
        </button>
        {completedCount > 0 &&
          (confirmClear ? (
            <span className="flex shrink-0 items-center gap-1 text-[11px]">
              <span className="text-slate-400">Delete {completedCount} done?</span>
              <button
                type="button"
                onClick={() => {
                  setTodos((prev) => prev.filter((t) => !t.done));
                  setConfirmClear(false);
                }}
                className="rounded-md bg-accred px-2 py-1 font-semibold text-white hover:bg-accred/85"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-md border border-edge px-2 py-1 text-slate-300"
              >
                No
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="shrink-0 rounded-md border border-edge px-2 py-1.5 text-[11px] text-slate-400 hover:border-accred/60 hover:text-accred"
            >
              Clear completed
            </button>
          ))}
      </form>

      <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {sorted.length === 0 && (
          <li className="p-5 text-center text-[13px] text-slate-500">
            Nothing on the list. Add a to-do above — it stays here until you delete it.
          </li>
        )}
        {sorted.map((todo) => (
          <li
            key={todo.id}
            className={`group flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-panel2 ${
              todo.done ? 'opacity-50' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggle(todo.id)}
              aria-label={`Mark “${todo.text}” ${todo.done ? 'active' : 'complete'}`}
              className="h-4 w-4 shrink-0 accent-[#C9A24B]"
            />
            <span
              className={`min-w-0 flex-1 text-[13px] ${
                todo.done ? 'text-slate-400 line-through' : 'text-slate-100'
              }`}
            >
              {todo.text}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-slate-500">
              {new Date(todo.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <button
              type="button"
              aria-label={`Delete “${todo.text}”`}
              onClick={() => remove(todo.id)}
              className="shrink-0 rounded p-0.5 text-slate-600 opacity-0 hover:bg-accred hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
            >
              <X size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
