'use client'

import { useActionState } from 'react'
import { updateApplicationStatus } from '@/app/actions/applications'
import { Button } from '@/components/ui/button'

const nextStatuses = [
  { value: 'reviewing', label: '審査中' },
  { value: 'shortlisted', label: '候補' },
  { value: 'hired', label: '採用' },
  { value: 'rejected', label: '不採用' },
]

export function ApplicationActions({
  applicationId,
  jobId,
  currentStatus,
}: {
  applicationId: string
  jobId: string
  currentStatus: string
}) {
  const [, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await updateApplicationStatus(formData)
    },
    null,
  )

  const available = nextStatuses.filter((s) => s.value !== currentStatus)

  return (
    <div className="flex items-center justify-end gap-1">
      {available.map((s) => (
        <form key={s.value} action={formAction}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="jobId" value={jobId} />
          <input type="hidden" name="status" value={s.value} />
          <Button variant="ghost" size="xs" disabled={pending} className="text-xs">
            {s.label}
          </Button>
        </form>
      ))}
    </div>
  )
}
