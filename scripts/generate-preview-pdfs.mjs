import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'documents')

const TEAL = rgb(32 / 255, 70 / 255, 82 / 255)
const GRAY = rgb(100 / 255, 100 / 255, 100 / 255)
const BLACK = rgb(0, 0, 0)
const LIGHT_GRAY = rgb(180 / 255, 180 / 255, 180 / 255)

class PDFBuilder {
  constructor(title, subtitle) {
    this.title = title
    this.subtitle = subtitle
    this.pages = []
    this.currentPage = null
    this.y = 0
    this.doc = null
    this.fonts = {}
    this.pageWidth = 612
    this.pageHeight = 792
    this.marginLeft = 60
    this.marginRight = 60
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

  newPage() {
    this.currentPage = this.doc.addPage([this.pageWidth, this.pageHeight])
    this.y = this.pageHeight - 60
    this.pages.push(this.currentPage)
    if (this.pages.length > 1) {
      this.drawFooter()
    }
  }

  ensureSpace(needed) {
    if (this.y - needed < 80) {
      this.drawFooter()
      this.newPage()
    }
  }

  drawHeader() {
    const page = this.currentPage
    // Title bar background
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

  drawFooter() {
    const page = this.currentPage
    const pageNum = this.pages.length
    page.drawText(`Page ${pageNum}`, {
      x: this.pageWidth / 2 - 15,
      y: 35,
      size: 8,
      font: this.fonts.regular,
      color: LIGHT_GRAY,
    })
    page.drawText('Heistand Family Foundation  |  Grant Portal Preview', {
      x: this.marginLeft,
      y: 35,
      size: 7,
      font: this.fonts.regular,
      color: LIGHT_GRAY,
    })
  }

  sectionHeading(text) {
    this.ensureSpace(40)
    this.y -= 12

    // Section accent line
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

  question(label, { required = false, description = '', wordLimit = '', type = 'text' } = {}) {
    const labelText = required ? `${label} *` : label
    const estimatedHeight = 30 + (description ? 14 : 0) + (wordLimit ? 14 : 0) + (type === 'textarea' ? 10 : 0)
    this.ensureSpace(estimatedHeight)

    // Bullet
    this.currentPage.drawCircle({
      x: this.marginLeft + 4,
      y: this.y + 3,
      size: 2.5,
      color: TEAL,
    })

    // Label
    this.currentPage.drawText(labelText, {
      x: this.marginLeft + 16,
      y: this.y,
      size: 10,
      font: this.fonts.bold,
      color: BLACK,
    })

    if (required) {
      // Draw the asterisk in red (it's already in the label text so this is visual emphasis)
    }

    this.y -= 14

    if (description) {
      const lines = this.wrapText(description, this.contentWidth - 16, 8.5, this.fonts.italic)
      for (const line of lines) {
        this.ensureSpace(14)
        this.currentPage.drawText(line, {
          x: this.marginLeft + 16,
          y: this.y,
          size: 8.5,
          font: this.fonts.italic,
          color: GRAY,
        })
        this.y -= 12
      }
    }

    if (wordLimit) {
      this.currentPage.drawText(wordLimit, {
        x: this.marginLeft + 16,
        y: this.y,
        size: 8,
        font: this.fonts.regular,
        color: LIGHT_GRAY,
      })
      this.y -= 12
    }

    if (type === 'textarea') {
      // Draw a light box to indicate text area
      this.ensureSpace(30)
      this.currentPage.drawRectangle({
        x: this.marginLeft + 16,
        y: this.y - 18,
        width: this.contentWidth - 30,
        height: 22,
        borderColor: LIGHT_GRAY,
        borderWidth: 0.5,
        color: rgb(248 / 255, 248 / 255, 248 / 255),
      })
      this.y -= 26
    } else if (type === 'input') {
      this.ensureSpace(20)
      this.currentPage.drawLine({
        start: { x: this.marginLeft + 16, y: this.y - 2 },
        end: { x: this.marginLeft + 250, y: this.y - 2 },
        thickness: 0.5,
        color: LIGHT_GRAY,
      })
      this.y -= 12
    }

    this.y -= 4
  }

  radioGroup(label, options, { required = false, description = '' } = {}) {
    this.ensureSpace(20 + options.length * 16)

    this.currentPage.drawCircle({
      x: this.marginLeft + 4,
      y: this.y + 3,
      size: 2.5,
      color: TEAL,
    })

    const labelText = required ? `${label} *` : label
    this.currentPage.drawText(labelText, {
      x: this.marginLeft + 16,
      y: this.y,
      size: 10,
      font: this.fonts.bold,
      color: BLACK,
    })
    this.y -= 14

    if (description) {
      const lines = this.wrapText(description, this.contentWidth - 16, 8.5, this.fonts.italic)
      for (const line of lines) {
        this.currentPage.drawText(line, {
          x: this.marginLeft + 16,
          y: this.y,
          size: 8.5,
          font: this.fonts.italic,
          color: GRAY,
        })
        this.y -= 12
      }
    }

    for (const opt of options) {
      this.ensureSpace(16)
      // Radio circle
      this.currentPage.drawCircle({
        x: this.marginLeft + 28,
        y: this.y + 3,
        size: 4,
        borderColor: GRAY,
        borderWidth: 0.8,
      })
      this.currentPage.drawText(opt, {
        x: this.marginLeft + 40,
        y: this.y,
        size: 9,
        font: this.fonts.regular,
        color: BLACK,
      })
      this.y -= 16
    }
    this.y -= 4
  }

  note(text) {
    this.ensureSpace(30)
    const lines = this.wrapText(text, this.contentWidth - 20, 8.5, this.fonts.italic)

    this.currentPage.drawRectangle({
      x: this.marginLeft + 4,
      y: this.y - (lines.length * 12) - 4,
      width: this.contentWidth - 8,
      height: lines.length * 12 + 12,
      color: rgb(245 / 255, 248 / 255, 250 / 255),
      borderColor: TEAL,
      borderWidth: 0.5,
    })

    for (const line of lines) {
      this.currentPage.drawText(line, {
        x: this.marginLeft + 14,
        y: this.y,
        size: 8.5,
        font: this.fonts.italic,
        color: GRAY,
      })
      this.y -= 12
    }
    this.y -= 10
  }

  dynamicField(label, description) {
    this.ensureSpace(36)
    this.currentPage.drawCircle({
      x: this.marginLeft + 4,
      y: this.y + 3,
      size: 2.5,
      color: TEAL,
    })
    this.currentPage.drawText(label, {
      x: this.marginLeft + 16,
      y: this.y,
      size: 10,
      font: this.fonts.bold,
      color: BLACK,
    })
    this.y -= 14
    if (description) {
      const lines = this.wrapText(description, this.contentWidth - 16, 8.5, this.fonts.italic)
      for (const line of lines) {
        this.currentPage.drawText(line, {
          x: this.marginLeft + 16,
          y: this.y,
          size: 8.5,
          font: this.fonts.italic,
          color: GRAY,
        })
        this.y -= 12
      }
    }
    // Repeating row indicator
    this.currentPage.drawText('[  Add entries as needed  ]', {
      x: this.marginLeft + 16,
      y: this.y,
      size: 8,
      font: this.fonts.regular,
      color: LIGHT_GRAY,
    })
    this.y -= 18
  }

  wrapText(text, maxWidth, fontSize, font) {
    const words = text.split(' ')
    const lines = []
    let current = ''
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      const width = font.widthOfTextAtSize(test, fontSize)
      if (width > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    if (current) lines.push(current)
    return lines
  }

  async save(filename) {
    // Draw footer on last page
    const bytes = await this.doc.save()
    fs.writeFileSync(path.join(outDir, filename), bytes)
    console.log(`  ✓ Generated ${filename} (${(bytes.length / 1024).toFixed(1)} KB, ${this.pages.length} pages)`)
  }
}

// ============================================================
// LOI PDF
// ============================================================
async function generateLOI() {
  const pdf = new PDFBuilder(
    'Letter of Intent (LOI) Preview',
    'Review the questions you will be asked when submitting a Letter of Intent'
  )
  await pdf.init()

  pdf.note(
    'This document previews all questions on the LOI form. Fields marked with * are required. ' +
    'You will complete this form online after creating an account at the Grant Portal.'
  )

  // Step 1
  pdf.sectionHeading('Step 1: Contact Information')
  pdf.question('Primary Contact Name', { required: true, type: 'input' })
  pdf.question('Primary Contact Title', { description: 'e.g., Executive Director', type: 'input' })
  pdf.question('Primary Contact Email', { required: true, type: 'input' })
  pdf.question('Primary Contact Phone', { type: 'input' })
  pdf.question('Executive Director', { description: 'Name of your organization\'s Executive Director', type: 'input' })

  // Step 2
  pdf.sectionHeading('Step 2: Expenditure Type & Focus Area')
  pdf.radioGroup('Expenditure Type', [
    'Programming / Special Project',
    'Operating Funding',
    'Capital Project (requires pre-approval from Foundation Director)',
  ], { required: true })

  pdf.radioGroup('Focus Area', [
    'Human Health & Wellbeing',
    'Education & Development',
    'Community Wellbeing',
  ], { required: true })

  // Step 3
  pdf.sectionHeading('Step 3: Project Context')
  pdf.radioGroup('Is this request for a new project or emerging need?', ['Yes', 'No'])
  pdf.question('If yes, please explain', { type: 'textarea' })
  pdf.radioGroup('Is this request for increasing capacity or rising operations costs?', ['Yes', 'No'])
  pdf.question('If yes, please explain', { type: 'textarea' })

  // Step 4
  pdf.sectionHeading('Step 4: Project Overview')
  pdf.question('Project Title', { required: true, description: 'e.g., Youth Literacy Initiative 2026', type: 'input' })
  pdf.question('Proposed Project Description', {
    required: true,
    description: 'Describe your proposed project, including what you hope to accomplish and how it aligns with the Heistand Family Foundation\'s mission.',
    wordLimit: 'Maximum 500 words',
    type: 'textarea',
  })
  pdf.question('Project Goals', {
    description: 'Describe the goals and objectives of your project.',
    wordLimit: 'Maximum 500 words',
    type: 'textarea',
  })
  pdf.question('Photos', {
    description: 'You may upload 1–3 JPG images that help illustrate your project.',
  })

  // Step 5
  pdf.sectionHeading('Step 5: Financial Information')
  pdf.question('Total Dollar Amount of Project ($)', { required: true, type: 'input' })
  pdf.question('Grant Request Amount ($)', { required: true, description: 'Amount being requested from HFF', type: 'input' })
  pdf.question('Percent of Total Project', { description: 'Auto-calculated based on amounts above' })
  pdf.question('Proposed Project Budget Outline', {
    required: true,
    description: 'Simple explanation of how grant funds would be spent. e.g., Staff salaries ($15,000), Program supplies ($5,000), Transportation ($3,000).',
    wordLimit: 'Maximum 250 words',
    type: 'textarea',
  })

  // Step 6
  pdf.sectionHeading('Step 6: Review & Submit')
  pdf.note(
    'You will review all your responses before submitting. A confirmation checkbox acknowledges that all information is accurate and complete. ' +
    'LOIs must be submitted by the deadline shown on the Grant Portal.'
  )

  await pdf.save('sample-loi.pdf')
}

// ============================================================
// APPLICATION PDF
// ============================================================
async function generateApplication() {
  const pdf = new PDFBuilder(
    'Full Application Preview',
    'Review the questions you will be asked when completing a full grant application'
  )
  await pdf.init()

  pdf.note(
    'This document previews all questions on the Full Application form. Fields marked with * are required. ' +
    'You will be invited to complete this form only after your LOI is approved.'
  )

  // Section 1
  pdf.sectionHeading('Section 1: Project Overview')
  pdf.question('Project Title', { required: true, type: 'input' })
  pdf.question('Project Description', {
    required: true,
    description: 'Describe your project in detail — what it will accomplish and who it will serve.',
    type: 'textarea',
  })
  pdf.question('Project Goals', {
    required: true,
    description: 'What are the specific, measurable goals of this project?',
    type: 'textarea',
  })

  // Section 2
  pdf.sectionHeading('Section 2: Target Population')
  pdf.question('Target Population Description', {
    required: true,
    description: 'Describe the children and families you will serve.',
    type: 'textarea',
  })
  pdf.question('Number of Children to be Served', { required: true, type: 'input' })
  pdf.question('Age Range (Start – End)', { description: 'e.g., 5 – 12', type: 'input' })
  pdf.question('Poverty Indicators', {
    required: true,
    description: 'How does your organization identify children in poverty? e.g., free/reduced lunch eligibility, income levels.',
    type: 'textarea',
  })

  // Section 3
  pdf.sectionHeading('Section 3: Demographics & Poverty Metrics')
  pdf.question('Client Demographic Description', {
    description: 'Describe the demographics of the population your project serves.',
    type: 'textarea',
  })
  pdf.question('Number of Children in Poverty Impacted', { type: 'input' })
  pdf.question('Total Children Served Annually', { type: 'input' })
  pdf.question('Poverty Percentage', { description: 'Auto-calculated from the two fields above' })

  // Section 4
  pdf.sectionHeading('Section 4: Project Timeline')
  pdf.question('Project Start Date', { required: true, type: 'input' })
  pdf.question('Project End Date', { required: true, type: 'input' })
  pdf.question('Additional Timeline Details', {
    description: 'Key milestones, phases, or other timeline information.',
    type: 'textarea',
  })
  pdf.question('Geographic Area Served', {
    required: true,
    description: 'Region, municipality, or neighborhood. HFF focuses on Nebraska and Western Iowa communities.',
    type: 'input',
  })

  // Section 5
  pdf.sectionHeading('Section 5: Funding Request')
  pdf.question('Amount Requested from HFF ($)', { required: true, type: 'input' })
  pdf.question('Total Project Budget ($)', { required: true, type: 'input' })
  pdf.dynamicField('Confirmed Funding Sources', 'List each source name and dollar amount. Add rows as needed.')
  pdf.dynamicField('Pending Funding Sources', 'List each source name and dollar amount for funding not yet confirmed.')
  pdf.question('Other Funding Sources', {
    description: 'e.g., United Way grant ($10,000), Individual donors ($5,000).',
    type: 'textarea',
  })
  pdf.question('Previous HFF Grants', {
    description: 'Check "No Grants Received" or list up to 3 previous grants with date, amount, and project title.',
  })

  // Section 6
  pdf.sectionHeading('Section 6: Outcomes & Impact')
  pdf.question('Expected Outcomes', {
    required: true,
    description: 'Specific, measurable outcomes. e.g., "80% of participants will improve reading scores by one grade level."',
    type: 'textarea',
  })
  pdf.question('Measurement Plan', {
    required: true,
    description: 'Describe your evaluation methods, data collection, and reporting.',
    type: 'textarea',
  })
  pdf.question('Sustainability Plan', {
    required: true,
    description: 'How will the project continue beyond the grant period?',
    type: 'textarea',
  })

  // Section 7
  pdf.sectionHeading('Section 7: Board of Directors')
  pdf.dynamicField(
    'Board Members (minimum 3)',
    'For each board member provide: Full Name, Title/Role, and Organization/Company Affiliation.'
  )

  // Section 8
  pdf.sectionHeading('Section 8: Attachments')
  pdf.question('Project Budget', {
    description: 'Upload a project budget spreadsheet (PDF, XLS, or XLSX, max 10 MB). An HFF budget template is available for download on the portal.',
  })
  pdf.question('Project Photos', {
    description: 'Upload up to 3 photos illustrating your project (JPEG or PNG, max 5 MB each).',
  })

  await pdf.save('sample-application.pdf')
}

// ============================================================
// MAIN
// ============================================================
console.log('Generating preview PDFs...')
await generateLOI()
await generateApplication()
console.log('Done!')
