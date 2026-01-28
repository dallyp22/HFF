'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { Highlighter, Trash2, MessageSquare, X, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDistanceToNow } from 'date-fns'

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export interface Highlight {
  id: string
  fieldName: string
  startOffset: number
  endOffset: number
  color: string
  comment?: string | null
  createdByName: string
  createdAt: string
}

interface HighlightableTextProps {
  text: string
  fieldName: string
  applicationId: string
  highlights: Highlight[]
  isAdmin: boolean
  onHighlightChange?: () => void
}

// -------------------------------------------------------------------
// Color helpers
// -------------------------------------------------------------------

const COLOR_MAP: Record<string, { bg: string; border: string; label: string }> = {
  yellow: {
    bg: 'bg-yellow-200/60',
    border: 'border-yellow-400',
    label: 'Yellow',
  },
  green: {
    bg: 'bg-emerald-200/60',
    border: 'border-emerald-400',
    label: 'Green',
  },
  blue: {
    bg: 'bg-sky-200/60',
    border: 'border-sky-400',
    label: 'Blue',
  },
}

const COLOR_SWATCH: Record<string, string> = {
  yellow: 'bg-yellow-400',
  green: 'bg-emerald-400',
  blue: 'bg-sky-400',
}

// -------------------------------------------------------------------
// Build non-overlapping segments from highlights
// -------------------------------------------------------------------

interface Segment {
  start: number
  end: number
  text: string
  highlights: Highlight[]
}

function buildSegments(text: string, highlights: Highlight[]): Segment[] {
  if (highlights.length === 0) {
    return [{ start: 0, end: text.length, text, highlights: [] }]
  }

  // Collect all boundary points
  const boundaries = new Set<number>()
  boundaries.add(0)
  boundaries.add(text.length)

  for (const h of highlights) {
    const start = Math.max(0, Math.min(h.startOffset, text.length))
    const end = Math.max(0, Math.min(h.endOffset, text.length))
    boundaries.add(start)
    boundaries.add(end)
  }

  const sorted = Array.from(boundaries).sort((a, b) => a - b)
  const segments: Segment[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i]
    const end = sorted[i + 1]
    if (start === end) continue

    const overlapping = highlights.filter(
      (h) => h.startOffset <= start && h.endOffset >= end
    )

    segments.push({
      start,
      end,
      text: text.slice(start, end),
      highlights: overlapping,
    })
  }

  return segments
}

// -------------------------------------------------------------------
// HighlightableText component
// -------------------------------------------------------------------

export function HighlightableText({
  text,
  fieldName,
  applicationId,
  highlights,
  isAdmin,
  onHighlightChange,
}: HighlightableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [popover, setPopover] = useState<{
    x: number
    y: number
    startOffset: number
    endOffset: number
  } | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('yellow')
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Tooltip state for existing highlights
  const [tooltip, setTooltip] = useState<{
    highlight: Highlight
    x: number
    y: number
  } | null>(null)

  const [deleting, setDeleting] = useState<string | null>(null)
  const tooltipHoveredRef = useRef(false)
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ensure portal only renders on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Helper to dismiss tooltip only if not hovering over it
  const scheduleTooltipDismiss = useCallback(() => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
    tooltipTimeoutRef.current = setTimeout(() => {
      if (!tooltipHoveredRef.current) {
        setTooltip(null)
      }
    }, 400)
  }, [])

  // ---------------------------------------------------------------
  // Text selection handler (admin only)
  // ---------------------------------------------------------------

  const handleMouseUp = useCallback(() => {
    if (!isAdmin) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !containerRef.current) return

    const range = selection.getRangeAt(0)

    // Ensure the selection is inside this container
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      return
    }

    // Compute offsets relative to the plain text content
    const startOffset = getTextOffset(containerRef.current, range.startContainer, range.startOffset)
    const endOffset = getTextOffset(containerRef.current, range.endContainer, range.endOffset)

    if (startOffset === endOffset || startOffset < 0 || endOffset < 0) return

    // Position popover using viewport coordinates
    const rect = range.getBoundingClientRect()

    setPopover({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      startOffset: Math.min(startOffset, endOffset),
      endOffset: Math.max(startOffset, endOffset),
    })
    setSelectedColor('yellow')
    setComment('')
  }, [isAdmin])

  // Close popover when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.closest('[data-highlight-popover]')) return
      // Don't close if clicking inside container for selection
      if (target.closest('[data-highlight-container]') && window.getSelection()?.toString()) return
      setPopover(null)
    }
    if (popover) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [popover])

  // ---------------------------------------------------------------
  // Create highlight
  // ---------------------------------------------------------------

  async function handleCreate() {
    if (!popover) return
    setSaving(true)

    try {
      const res = await fetch(`/api/applications/${applicationId}/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldName,
          startOffset: popover.startOffset,
          endOffset: popover.endOffset,
          color: selectedColor,
          comment: comment.trim() || undefined,
        }),
      })

      if (res.ok) {
        toast.success('Highlight added')
        setPopover(null)
        window.getSelection()?.removeAllRanges()
        onHighlightChange?.()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to add highlight')
      }
    } catch {
      toast.error('Failed to add highlight')
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------
  // Delete highlight
  // ---------------------------------------------------------------

  async function handleDelete(highlightId: string) {
    setDeleting(highlightId)
    try {
      const res = await fetch(
        `/api/applications/${applicationId}/highlights?highlightId=${highlightId}`,
        { method: 'DELETE' }
      )

      if (res.ok) {
        toast.success('Highlight removed')
        setTooltip(null)
        onHighlightChange?.()
      } else {
        toast.error('Failed to remove highlight')
      }
    } catch {
      toast.error('Failed to remove highlight')
    } finally {
      setDeleting(null)
    }
  }

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------

  if (!text) {
    return <span className="text-gray-400 italic">Not specified</span>
  }

  const fieldHighlights = highlights.filter((h) => h.fieldName === fieldName)
  const segments = buildSegments(text, fieldHighlights)

  return (
    <div className="relative" data-highlight-container>
      {/* Rendered text */}
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className={`leading-relaxed whitespace-pre-wrap ${
          isAdmin ? 'cursor-text select-text' : ''
        }`}
      >
        {segments.map((seg, i) => {
          if (seg.highlights.length === 0) {
            return <span key={i}>{seg.text}</span>
          }

          // Use the first highlight's color for background
          const primary = seg.highlights[0]
          const colorCfg = COLOR_MAP[primary.color] || COLOR_MAP.yellow

          return (
            <span
              key={i}
              className={`${colorCfg.bg} rounded-sm px-0.5 -mx-0.5 cursor-pointer border-b-2 ${colorCfg.border} transition-colors hover:opacity-80`}
              onMouseEnter={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect()
                setTooltip({
                  highlight: primary,
                  x: rect.left + rect.width / 2,
                  y: rect.bottom + 4,
                })
              }}
              onMouseLeave={() => {
                scheduleTooltipDismiss()
              }}
            >
              {seg.text}
            </span>
          )
        })}
      </div>

      {/* Admin hint */}
      {isAdmin && fieldHighlights.length === 0 && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
          <Highlighter className="w-3 h-3" />
          <span>Select text to highlight</span>
        </div>
      )}

      {/* Creation popover - portaled to document.body to escape all overflow/transform/backdrop-blur containers */}
      {mounted && popover && isAdmin && createPortal(
        <div
          data-highlight-popover
          className="w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 space-y-3"
          style={{
            position: 'fixed',
            left: `${popover.x}px`,
            top: `${popover.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 99999,
          }}
        >
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-white border-r border-b border-gray-200"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Highlighter className="w-3.5 h-3.5 text-[var(--hff-teal)]" />
              Add Highlight
            </span>
            <button
              onClick={() => {
                setPopover(null)
                window.getSelection()?.removeAllRanges()
              }}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Color:</span>
            {Object.entries(COLOR_SWATCH).map(([key, swatch]) => (
              <button
                key={key}
                onClick={() => setSelectedColor(key)}
                className={`w-6 h-6 rounded-full ${swatch} transition-all ${
                  selectedColor === key
                    ? 'ring-2 ring-offset-1 ring-[var(--hff-teal)] scale-110'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title={COLOR_MAP[key].label}
              />
            ))}
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <MessageSquare className="w-3 h-3" />
              Comment (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note about this text..."
              rows={2}
              className="text-xs resize-none bg-gray-50 border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPopover(null)
                window.getSelection()?.removeAllRanges()
              }}
              className="text-xs h-7 px-2"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={saving}
              className="text-xs h-7 px-3 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90 text-white"
            >
              {saving ? 'Saving...' : 'Highlight'}
            </Button>
          </div>
        </div>,
        document.body
      )}

      {/* Existing highlight tooltip - portaled to document.body */}
      {mounted && tooltip && createPortal(
        <div
          data-highlight-popover
          className="w-56 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 space-y-2"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            zIndex: 99999,
          }}
          onMouseEnter={() => {
            tooltipHoveredRef.current = true
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
          }}
          onMouseLeave={() => {
            tooltipHoveredRef.current = false
            scheduleTooltipDismiss()
          }}
        >
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rotate-45 bg-white border-l border-t border-gray-200"
          />

          {/* Author info */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-5 h-5 rounded-full bg-[var(--hff-teal)]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-[var(--hff-teal)]" />
            </div>
            <span className="font-medium text-gray-800">{tooltip.highlight.createdByName}</span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(tooltip.highlight.createdAt), { addSuffix: true })}
          </div>

          {/* Comment */}
          {tooltip.highlight.comment && (
            <div className="pt-1.5 border-t border-gray-100">
              <p className="text-xs text-gray-700 leading-relaxed">
                {tooltip.highlight.comment}
              </p>
            </div>
          )}

          {/* Delete (admin only) */}
          {isAdmin && (
            <div className="pt-1.5 border-t border-gray-100">
              <button
                onClick={() => handleDelete(tooltip.highlight.id)}
                disabled={deleting === tooltip.highlight.id}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {deleting === tooltip.highlight.id ? 'Removing...' : 'Remove highlight'}
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

// -------------------------------------------------------------------
// Utility: compute text offset from a DOM range position
// -------------------------------------------------------------------

function getTextOffset(root: Node, targetNode: Node, targetOffset: number): number {
  let offset = 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node: Text | null = null

  while ((node = walker.nextNode() as Text | null)) {
    if (node === targetNode) {
      return offset + targetOffset
    }
    offset += node.textContent?.length || 0
  }

  // If targetNode is an element, try to account for that
  if (targetNode.nodeType === Node.ELEMENT_NODE) {
    const children = targetNode.childNodes
    let count = 0
    for (let i = 0; i < children.length && i < targetOffset; i++) {
      count += children[i].textContent?.length || 0
    }
    // Walk from root to targetNode to get the prefix length
    let prefixLen = 0
    const walker2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let n2: Text | null = null
    while ((n2 = walker2.nextNode() as Text | null)) {
      if (targetNode.contains(n2)) break
      prefixLen += n2.textContent?.length || 0
    }
    return prefixLen + count
  }

  return -1
}
