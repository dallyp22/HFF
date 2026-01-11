'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Note {
  id: string
  authorId: string
  authorName: string
  content: string
  isPrivate: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

interface NotesPanelProps {
  applicationId: string
  initialNotes: Note[]
}

export function NotesPanel({ applicationId, initialNotes }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [newNote, setNewNote] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAddNote() {
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }

    setAdding(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      })

      if (response.ok) {
        const note = await response.json()
        setNotes([note, ...notes])
        setNewNote('')
        toast.success('Note added successfully')
      } else {
        toast.error('Failed to add note')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Textarea
              placeholder="Add a private note about this application..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || adding}
              className="w-full sm:w-auto"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {adding ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-gray-500">
                No notes yet. Add the first note above.
              </p>
            </CardContent>
          </Card>
        ) : (
          notes.map(note => (
            <Card key={note.id} className="border-l-4 border-[var(--hff-teal)]">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {note.authorName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{note.authorName}</p>
                      <Badge variant="outline" className="text-xs bg-yellow-50">
                        Private
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
