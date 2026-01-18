'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Users, MoreVertical, UserPlus, Loader2 } from 'lucide-react'
import { InviteReviewerDialog } from '@/components/admin/InviteReviewerDialog'
import { RemoveUserDialog } from '@/components/admin/RemoveUserDialog'
import { toast } from 'sonner'

interface Reviewer {
  id: string
  userId: string
  role: string
  createdAt: string
  publicUserData: {
    firstName?: string
    lastName?: string
    identifier: string
  }
}

const ROLE_DISPLAY: Record<string, string> = {
  'admin': 'Admin',
  'org:admin': 'Admin',
  'org:manager': 'Manager',
  'org:member': 'Member',
}

const ROLE_COLORS: Record<string, string> = {
  'Admin': 'bg-purple-100 text-purple-700',
  'Manager': 'bg-blue-100 text-blue-700',
  'Member': 'bg-gray-100 text-gray-700',
}

export default function ManageReviewersPage() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [filteredReviewers, setFilteredReviewers] = useState<Reviewer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Reviewer | null>(null)
  const [changingRole, setChangingRole] = useState<string | null>(null)

  const fetchReviewers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch reviewers')
      const data = await response.json()
      setReviewers(data.reviewers || [])
      setFilteredReviewers(data.reviewers || [])
    } catch (error) {
      console.error('Error fetching reviewers:', error)
      toast.error('Failed to load reviewers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviewers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReviewers(reviewers)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredReviewers(
        reviewers.filter(reviewer => {
          const name = `${reviewer.publicUserData.firstName || ''} ${reviewer.publicUserData.lastName || ''}`.toLowerCase()
          const email = reviewer.publicUserData.identifier.toLowerCase()
          return name.includes(query) || email.includes(query)
        })
      )
    }
  }, [searchQuery, reviewers])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to change role')
      }

      toast.success('Role updated successfully')
      await fetchReviewers()
    } catch (error: any) {
      console.error('Error changing role:', error)
      toast.error(error.message || 'Failed to change role')
    } finally {
      setChangingRole(null)
    }
  }

  const handleRemoveUser = (reviewer: Reviewer) => {
    setSelectedUser(reviewer)
    setRemoveDialogOpen(true)
  }

  const onRemoveSuccess = () => {
    fetchReviewers()
    setRemoveDialogOpen(false)
    setSelectedUser(null)
  }

  const getDisplayName = (reviewer: Reviewer) => {
    const { firstName, lastName } = reviewer.publicUserData
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim()
    }
    return reviewer.publicUserData.identifier
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Reviewers</h1>
            <p className="text-gray-600">
              {reviewers.length} reviewer{reviewers.length !== 1 ? 's' : ''} in system
            </p>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Reviewer
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Input
              placeholder="Search reviewers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Reviewers List */}
        <Card>
          <CardHeader>
            <CardTitle>Reviewers</CardTitle>
            <CardDescription>Manage reviewer access and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredReviewers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">
                  {searchQuery ? 'No reviewers found matching your search' : 'No reviewers yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviewers.map((reviewer) => (
                    <TableRow key={reviewer.id}>
                      <TableCell className="font-medium">
                        {getDisplayName(reviewer)}
                      </TableCell>
                      <TableCell>{reviewer.publicUserData.identifier}</TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[ROLE_DISPLAY[reviewer.role]] || 'bg-gray-100 text-gray-700'}>
                          {ROLE_DISPLAY[reviewer.role] || reviewer.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(reviewer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={changingRole === reviewer.userId}
                            >
                              {changingRole === reviewer.userId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(reviewer.userId, 'org:admin')}
                              disabled={ROLE_DISPLAY[reviewer.role] === 'Admin'}
                            >
                              Change to Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(reviewer.userId, 'org:manager')}
                              disabled={ROLE_DISPLAY[reviewer.role] === 'Manager'}
                            >
                              Change to Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(reviewer.userId, 'org:member')}
                              disabled={ROLE_DISPLAY[reviewer.role] === 'Member'}
                            >
                              Change to Member
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemoveUser(reviewer)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <InviteReviewerDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onSuccess={() => {
            fetchReviewers()
            setInviteDialogOpen(false)
          }}
        />

        {selectedUser && (
          <RemoveUserDialog
            open={removeDialogOpen}
            onOpenChange={setRemoveDialogOpen}
            user={selectedUser}
            onSuccess={onRemoveSuccess}
          />
        )}
      </div>
    </div>
  )
}
