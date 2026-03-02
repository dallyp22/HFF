import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from 'pdf-lib'

const TEAL: RGB = rgb(32 / 255, 70 / 255, 82 / 255)
const GRAY: RGB = rgb(100 / 255, 100 / 255, 100 / 255)
const BLACK: RGB = rgb(0, 0, 0)
const LIGHT_GRAY: RGB = rgb(180 / 255, 180 / 255, 180 / 255)
const FIELD_BG: RGB = rgb(248 / 255, 248 / 255, 248 / 255)

export class PDFBuilder {
  private title: string
  private subtitle: string
  private pages: PDFPage[] = []
  private currentPage!: PDFPage
  private y = 0
  private doc!: PDFDocument
  private fonts: { regular: PDFFont; bold: PDFFont; italic: PDFFont } = {} as any
  private pageWidth = 612
  private pageHeight = 792
  private marginLeft = 60
  private marginRight = 60
  private contentWidth: number

  constructor(title: string, subtitle: string) {
    this.title = title
    this.subtitle = subtitle
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight
  }

  async init() {
    this.doc = await PDFDocument.create()
    this.fonts.regular = await this.doc.embedFont(StandardFonts.Helvetica)
    this.fonts.bold = await this.doc.embedFont(StandardFonts.HelveticaBold)
    this.fonts.italic = await this.doc.embedFont(StandardFonts.HelveticaOblique)
    this.newPage()
    this.drawHeader()
  }

  private newPage() {
    this.currentPage = this.doc.addPage([this.pageWidth, this.pageHeight])
    this.y = this.pageHeight - 60
    this.pages.push(this.currentPage)
    if (this.pages.length > 1) {
      this.drawFooter()
    }
  }

  private ensureSpace(needed: number) {
    if (this.y - needed < 80) {
      this.drawFooter()
      this.newPage()
    }
  }

  private drawHeader() {
    const page = this.currentPage
    page.drawRectangle({
      x: 0,
      y: this.pageHeight - 110,
      width: this.pageWidth,
      height: 110,
      color: TEAL,
    })

    page.drawText('HEISTAND FAMILY FOUNDATION', {
      x: this.marginLeft,
      y: this.pageHeight - 40,
      size: 11,
      font: this.fonts.bold,
      color: rgb(1, 1, 1),
    })

    page.drawText(this.title, {
      x: this.marginLeft,
      y: this.pageHeight - 68,
      size: 22,
      font: this.fonts.bold,
      color: rgb(1, 1, 1),
    })

    page.drawText(this.subtitle, {
      x: this.marginLeft,
      y: this.pageHeight - 90,
      size: 10,
      font: this.fonts.italic,
      color: rgb(200 / 255, 220 / 255, 225 / 255),
    })

    this.y = this.pageHeight - 135
    this.drawFooter()
  }

  private drawFooter() {
    const page = this.currentPage
    const pageNum = this.pages.length
    page.drawText(`Page ${pageNum}`, {
      x: this.pageWidth / 2 - 15,
      y: 35,
      size: 8,
      font: this.fonts.regular,
      color: LIGHT_GRAY,
    })
    page.drawText('Heistand Family Foundation  |  Grant Portal', {
      x: this.marginLeft,
      y: 35,
      size: 7,
      font: this.fonts.regular,
      color: LIGHT_GRAY,
    })
  }

  sectionHeading(text: string) {
    this.ensureSpace(40)
    this.y -= 12

    this.currentPage.drawRectangle({
      x: this.marginLeft,
      y: this.y - 2,
      width: this.contentWidth,
      height: 1,
      color: TEAL,
    })
    this.y -= 18
    this.currentPage.drawText(text.toUpperCase(), {
      x: this.marginLeft,
      y: this.y,
      size: 12,
      font: this.fonts.bold,
      color: TEAL,
    })
    this.y -= 18
  }

  /** Render a labeled field with its actual value */
  field(label: string, value: string | null | undefined) {
    const displayValue = value?.trim() || '—'
    const valueLines = this.wrapText(displayValue, this.contentWidth - 16, 10, this.fonts.regular)
    const estimatedHeight = 18 + valueLines.length * 14 + 8
    this.ensureSpace(estimatedHeight)

    // Label
    this.currentPage.drawText(label, {
      x: this.marginLeft,
      y: this.y,
      size: 9,
      font: this.fonts.bold,
      color: GRAY,
    })
    this.y -= 16

    // Value lines
    for (const line of valueLines) {
      this.ensureSpace(16)
      this.currentPage.drawText(line, {
        x: this.marginLeft,
        y: this.y,
        size: 10,
        font: this.fonts.regular,
        color: BLACK,
      })
      this.y -= 14
    }
    this.y -= 4
  }

  /** Render a long text field in a shaded box */
  textBlock(label: string, value: string | null | undefined) {
    const displayValue = value?.trim() || 'Not provided'
    const valueLines = this.wrapText(displayValue, this.contentWidth - 32, 9.5, this.fonts.regular)
    const boxHeight = valueLines.length * 13 + 16
    const totalHeight = 20 + boxHeight + 8
    this.ensureSpace(Math.min(totalHeight, 200))

    // Label
    this.currentPage.drawText(label, {
      x: this.marginLeft,
      y: this.y,
      size: 9,
      font: this.fonts.bold,
      color: GRAY,
    })
    this.y -= 16

    // Draw background box for first chunk
    const linesPerChunk = Math.min(valueLines.length, 12)
    const firstBoxH = linesPerChunk * 13 + 12
    this.currentPage.drawRectangle({
      x: this.marginLeft,
      y: this.y - firstBoxH + 8,
      width: this.contentWidth,
      height: firstBoxH,
      color: FIELD_BG,
      borderColor: LIGHT_GRAY,
      borderWidth: 0.5,
    })

    for (const line of valueLines) {
      this.ensureSpace(16)
      this.currentPage.drawText(line, {
        x: this.marginLeft + 10,
        y: this.y,
        size: 9.5,
        font: this.fonts.regular,
        color: BLACK,
      })
      this.y -= 13
    }
    this.y -= 8
  }

  /** Render two fields side by side */
  fieldRow(left: { label: string; value: string | null | undefined }, right: { label: string; value: string | null | undefined }) {
    const halfWidth = this.contentWidth / 2 - 10
    this.ensureSpace(36)

    // Left label
    this.currentPage.drawText(left.label, {
      x: this.marginLeft,
      y: this.y,
      size: 9,
      font: this.fonts.bold,
      color: GRAY,
    })
    // Right label
    this.currentPage.drawText(right.label, {
      x: this.marginLeft + halfWidth + 20,
      y: this.y,
      size: 9,
      font: this.fonts.bold,
      color: GRAY,
    })
    this.y -= 16

    // Left value
    const leftVal = left.value?.trim() || '—'
    const leftLines = this.wrapText(leftVal, halfWidth, 10, this.fonts.regular)
    const rightVal = right.value?.trim() || '—'
    const rightLines = this.wrapText(rightVal, halfWidth, 10, this.fonts.regular)

    const maxLines = Math.max(leftLines.length, rightLines.length)
    for (let i = 0; i < maxLines; i++) {
      this.ensureSpace(16)
      if (leftLines[i]) {
        this.currentPage.drawText(leftLines[i], {
          x: this.marginLeft,
          y: this.y,
          size: 10,
          font: this.fonts.regular,
          color: BLACK,
        })
      }
      if (rightLines[i]) {
        this.currentPage.drawText(rightLines[i], {
          x: this.marginLeft + halfWidth + 20,
          y: this.y,
          size: 10,
          font: this.fonts.regular,
          color: BLACK,
        })
      }
      this.y -= 14
    }
    this.y -= 4
  }

  /** Render a status badge */
  statusBadge(label: string, status: string) {
    this.ensureSpace(30)
    this.currentPage.drawText(label + ':', {
      x: this.marginLeft,
      y: this.y,
      size: 9,
      font: this.fonts.bold,
      color: GRAY,
    })

    const statusWidth = this.fonts.bold.widthOfTextAtSize(status, 10) + 16
    this.currentPage.drawRectangle({
      x: this.marginLeft + 80,
      y: this.y - 4,
      width: statusWidth,
      height: 18,
      color: TEAL,
      borderWidth: 0,
    })
    this.currentPage.drawText(status, {
      x: this.marginLeft + 88,
      y: this.y,
      size: 10,
      font: this.fonts.bold,
      color: rgb(1, 1, 1),
    })
    this.y -= 28
  }

  /** Render a table of items (e.g., board members, funding sources) */
  table(label: string, headers: string[], rows: string[][]) {
    this.ensureSpace(40)

    // Label
    this.currentPage.drawText(label, {
      x: this.marginLeft,
      y: this.y,
      size: 9,
      font: this.fonts.bold,
      color: GRAY,
    })
    this.y -= 18

    if (rows.length === 0) {
      this.currentPage.drawText('None provided', {
        x: this.marginLeft,
        y: this.y,
        size: 10,
        font: this.fonts.italic,
        color: GRAY,
      })
      this.y -= 18
      return
    }

    const colWidth = this.contentWidth / headers.length

    // Header row
    this.ensureSpace(24)
    this.currentPage.drawRectangle({
      x: this.marginLeft,
      y: this.y - 4,
      width: this.contentWidth,
      height: 18,
      color: FIELD_BG,
    })
    for (let i = 0; i < headers.length; i++) {
      this.currentPage.drawText(headers[i], {
        x: this.marginLeft + i * colWidth + 6,
        y: this.y,
        size: 8,
        font: this.fonts.bold,
        color: GRAY,
      })
    }
    this.y -= 20

    // Data rows
    for (const row of rows) {
      this.ensureSpace(20)
      for (let i = 0; i < row.length; i++) {
        const cellText = row[i] || '—'
        const truncated = this.truncateText(cellText, colWidth - 12, 9, this.fonts.regular)
        this.currentPage.drawText(truncated, {
          x: this.marginLeft + i * colWidth + 6,
          y: this.y,
          size: 9,
          font: this.fonts.regular,
          color: BLACK,
        })
      }
      this.y -= 16
    }
    this.y -= 6
  }

  /** Add vertical space */
  spacer(height = 10) {
    this.y -= height
  }

  private truncateText(text: string, maxWidth: number, fontSize: number, font: PDFFont): string {
    if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) return text
    let truncated = text
    while (truncated.length > 0 && font.widthOfTextAtSize(truncated + '...', fontSize) > maxWidth) {
      truncated = truncated.slice(0, -1)
    }
    return truncated + '...'
  }

  private wrapText(text: string, maxWidth: number, fontSize: number, font: PDFFont): string[] {
    const paragraphs = text.split('\n')
    const allLines: string[] = []

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        allLines.push('')
        continue
      }
      const words = paragraph.split(' ')
      let current = ''
      for (const word of words) {
        const test = current ? `${current} ${word}` : word
        const width = font.widthOfTextAtSize(test, fontSize)
        if (width > maxWidth && current) {
          allLines.push(current)
          current = word
        } else {
          current = test
        }
      }
      if (current) allLines.push(current)
    }
    return allLines
  }

  async save(): Promise<Uint8Array> {
    this.drawFooter()
    return this.doc.save()
  }
}
