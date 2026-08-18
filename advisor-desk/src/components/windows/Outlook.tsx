import { useState } from 'react';
import { ArrowLeft, PenSquare } from 'lucide-react';
import { formatMailTime, useMail } from '../../hooks/useMail';
import type { MailFilter } from '../../hooks/useMail';
import type { MailMessage } from '../../types';

const FOLDERS: { id: MailFilter; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'flagged', label: 'Flagged' },
  { id: 'sent', label: 'Sent' },
  { id: 'compliance', label: 'Compliance' },
];

export function Outlook() {
  const { messages, filter, setFilter, markRead, unreadCount } = useMail();
  const [openMessage, setOpenMessage] = useState<MailMessage | null>(null);

  if (openMessage) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-edge p-2">
          <button
            type="button"
            onClick={() => setOpenMessage(null)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-slate-400 hover:bg-panel2 hover:text-slate-100"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <span className="font-mono text-[11px] text-slate-500">
            {formatMailTime(openMessage.time)}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <h3 className="text-[15px] font-bold text-slate-100">{openMessage.subject}</h3>
          <div className="mt-1 text-[12px] text-slate-400">From: {openMessage.from}</div>
          <p className="mt-4 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-200">
            {openMessage.body}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-edge p-2">
        <button
          type="button"
          className="mr-1 flex items-center gap-1.5 rounded-md bg-accblue px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-accblue/85"
        >
          <PenSquare size={13} />
          New message
        </button>
        {FOLDERS.map((folder) => (
          <button
            key={folder.id}
            type="button"
            aria-pressed={filter === folder.id}
            onClick={() => setFilter(folder.id)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              filter === folder.id
                ? 'border-accblue/60 bg-accblue/15 text-accblue'
                : 'border-edge text-slate-400 hover:text-slate-200'
            }`}
          >
            {folder.label}
            {folder.id === 'inbox' && unreadCount > 0 && (
              <span className="ml-1 font-mono text-[10px]">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <li className="p-4 text-center text-[13px] text-slate-500">Nothing in this folder.</li>
        )}
        {messages.map((msg) => (
          <li key={msg.id} className="border-b border-edge/60">
            <button
              type="button"
              onClick={() => {
                markRead(msg.id);
                setOpenMessage({ ...msg, unread: false });
              }}
              className={`w-full border-l-2 px-3 py-2 text-left hover:bg-panel2 ${
                msg.unread ? 'border-brass' : 'border-transparent'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`truncate text-[13px] ${
                    msg.unread ? 'font-bold text-slate-100' : 'font-medium text-slate-300'
                  }`}
                >
                  {msg.from}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-slate-500">
                  {formatMailTime(msg.time)}
                </span>
              </div>
              <div
                className={`truncate text-[12px] ${
                  msg.unread ? 'font-semibold text-slate-200' : 'text-slate-400'
                }`}
              >
                {msg.subject}
              </div>
              <div className="truncate text-[11px] text-slate-500">{msg.preview}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
