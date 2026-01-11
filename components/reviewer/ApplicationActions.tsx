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
    <div className="flex flex-wrap gap-2">
      {isAdmin && (
        <>
          <Button
            onClick={() => setStatusDialogOpen(true)}
            className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-dark)] text-white"
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

      {isManager && !isAdmin && (
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
      
      {/* Show info button for admins too */}
      {isAdmin && (
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
