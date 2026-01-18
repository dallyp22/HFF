'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Clock, Lock, User } from 'lucide-react'
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

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Add Note Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--hff-teal)]/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-[var(--hff-teal)]" />
            </div>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Add a note about this application..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="resize-none bg-white/50 border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Notes are visible to all reviewers</span>
                </div>
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || adding}
                  size="sm"
                  className="gap-1.5 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
                >
                  <Send className="w-4 h-4" />
                  {adding ? 'Adding...' : 'Add Note'}
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Notes List */}
      <div className="space-y-3">
        <AnimatePresence>
          {notes.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard className="py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notes Yet</h3>
                <p className="text-gray-500">Be the first to add a note about this application.</p>
              </GlassCard>
            </motion.div>
          ) : (
            notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-4 relative overflow-hidden">
                  {/* Accent Border */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--hff-teal)] to-[var(--hff-sage)]" />

                  <div className="flex items-start gap-3 pl-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--hff-teal)] to-[var(--hff-slate)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {getInitials(note.authorName)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="font-medium text-gray-900">{note.authorName}</span>
                        {note.isPrivate && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Note Content */}
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Notes Count */}
      {notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <span className="text-sm text-gray-500">
            {notes.length} note{notes.length !== 1 ? 's' : ''} on this application
          </span>
        </motion.div>
      )}
    </div>
  )
}
