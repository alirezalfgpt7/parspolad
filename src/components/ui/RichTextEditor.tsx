import React, { useRef, useState } from 'react';
import { Bold, Code, Italic, Link2, List, ListOrdered } from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitizeHtml.ts';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  minHeight?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  minHeight = 160,
}) => {
  const [sourceMode, setSourceMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    if (editorRef.current) {
      onChange(sanitizeHtml(editorRef.current.innerHTML));
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => exec('bold')} className="rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700" title="Bold"><Bold className="h-4 w-4" /></button>
            <button type="button" onClick={() => exec('italic')} className="rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700" title="Italic"><Italic className="h-4 w-4" /></button>
            <button type="button" onClick={() => exec('insertUnorderedList')} className="rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700" title="Bullet List"><List className="h-4 w-4" /></button>
            <button type="button" onClick={() => exec('insertOrderedList')} className="rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700" title="Ordered List"><ListOrdered className="h-4 w-4" /></button>
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('آدرس لینک را وارد کنید:');
                if (url) exec('createLink', url);
              }}
              className="rounded p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Insert Link"
            >
              <Link2 className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSourceMode((m) => !m)}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Code className="h-3.5 w-3.5" />
            <span>{sourceMode ? 'نمای بصری' : 'کد HTML'}</span>
          </button>
        </div>

        {sourceMode ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight }}
            dir="ltr"
            className="w-full bg-slate-950 p-3 font-mono text-xs text-emerald-300 focus:outline-none"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onChange(sanitizeHtml((e.target as HTMLDivElement).innerHTML))}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
            style={{ minHeight }}
            className="prose prose-sm max-w-none p-3.5 text-sm text-slate-800 focus:outline-none dark:prose-invert dark:text-slate-200"
          />
        )}
      </div>
    </div>
  );
};
