'use client'

import { useTransition, useRef } from 'react'
import { createNote } from '@/app/actions/candidates'
import { toast } from 'sonner'
import { MessageSquarePlus } from 'lucide-react'

interface NoteFormProps {
  applicationId: string
}

export function NoteForm({ applicationId }: NoteFormProps) {
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createNote(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('メモを追加しました')
        if (textareaRef.current) textareaRef.current.value = ''
      }
    })
  }

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          name="body"
          rows={1}
          placeholder="メモを追加..."
          className="flex-1 text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          追加
        </button>
      </div>
    </form>
  )
}
