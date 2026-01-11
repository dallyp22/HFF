'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StatusChangeDialog } from './StatusChangeDialog'
import { InfoRequestDialog } from './InfoRequestDialog'

interface ApplicationActionsProps {
  applicationId: string
  currentStatus: string
  approveVotes: number
  declineVotes: number
  isAdmin: boolean
  isManager: boolean
}

export function ApplicationActions({
  applicationId,
  currentStatus,
  approveVotes,
  declineVotes,
  isAdmin,
  isManager,
}: ApplicationActionsProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)

  return (
    <div className="flex gap-2">
      {isAdmin && (
        <>
          <Button
            variant="outline"
            onClick={() => setStatusDialogOpen(true)}
          >
            Change Status
          </Button>
          <StatusChangeDialog
            applicationId={applicationId}
            currentStatus={currentStatus}
            approveVotes={approveVotes}
            declineVotes={declineVotes}
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
          />
        </>
      )}

      {isManager && (
        <>
          <Button
            variant="outline"
            onClick={() => setInfoDialogOpen(true)}
          >
            Request Information
          </Button>
          <InfoRequestDialog
            applicationId={applicationId}
            open={infoDialogOpen}
            onOpenChange={setInfoDialogOpen}
          />
        </>
      )}
    </div>
  )
}
