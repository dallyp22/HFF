'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Reviewer {
  id: string
  userId: string
  role: string
  publicUserData: {
    firstName?: string
    lastName?: string
    identifier: string
  }
}

interface RemoveUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Reviewer
  onSuccess: () => void
}

export function RemoveUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: RemoveUserDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false)

  const getDisplayName = () => {
    const { firstName, lastName, identifier } = user.publicUserData
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim()
    }
    return identifier
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      const response = await fetch(`/api/admin/users/${user.userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove user')
      }

      toast.success(`${getDisplayName()} has been removed from the review team`)
      onSuccess()
    } catch (error: any) {
      console.error('Error removing user:', error)
      toast.error(error.message || 'Failed to remove user')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Remove Reviewer</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-4">
            Are you sure you want to remove <strong>{getDisplayName()}</strong> ({user.publicUserData.identifier}) from the HFF Review Team?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="font-semibold text-red-900 mb-2">This action will:</h4>
          <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
            <li>Remove their access to the reviewer portal</li>
            <li>Remove them from the HFF Reviewers organization</li>
            <li>Prevent them from viewing or managing applications</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600">
          You can invite them again later if needed.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remove User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
