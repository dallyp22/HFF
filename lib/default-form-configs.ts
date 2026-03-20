// Default form configurations for LOI and Full Application
// These define the structure, labels, and field properties that admins can customize

export interface FormFieldConfig {
  key: string           // Maps to database column
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'radio' | 'checkbox' | 'select' | 'currency' | 'file'
  placeholder?: string
  helpText?: string
  required: boolean
  visible: boolean
  wordLimit?: number
  options?: { value: string; label: string; note?: string }[]
}

export interface FormStepConfig {
  id: number
  title: string
  description: string
  fields: FormFieldConfig[]
}

export interface FormConfigData {
  formType: 'LOI' | 'APPLICATION'
  steps: FormStepConfig[]
}

export const defaultLOIConfig: FormConfigData = {
  formType: 'LOI',
  steps: [
    {
      id: 1,
      title: 'Contact Information',
      description: 'Verify your contact details',
      fields: [
        { key: 'primaryContactName', label: 'Primary Contact Name', type: 'text', placeholder: 'Full name', required: true, visible: true },
        { key: 'primaryContactTitle', label: 'Title', type: 'text', placeholder: 'e.g., Executive Director', required: false, visible: true },
        { key: 'primaryContactEmail', label: 'Email', type: 'text', placeholder: 'email@organization.org', required: true, visible: true },
        { key: 'primaryContactPhone', label: 'Phone', type: 'text', placeholder: '(555) 123-4567', required: false, visible: true },
        { key: 'executiveDirector', label: 'Executive Director', type: 'text', placeholder: 'Executive Director name', required: false, visible: true },
      ],
    },
    {
      id: 2,
      title: 'Expenditure Type',
      description: 'Type of funding request',
      fields: [
        {
          key: 'expenditureType',
          label: 'Expenditure Type',
          type: 'radio',
          required: true,
          visible: true,
          options: [
            { value: 'PROGRAMMING', label: 'Programming / Special Project' },
            { value: 'OPERATING', label: 'Operating Funding' },
            { value: 'CAPITAL', label: 'Capital Project', note: 'Requires pre-approval' },
          ],
        },
        {
          key: 'focusArea',
          label: 'Focus Area',
          type: 'radio',
          required: true,
          visible: true,
          options: [
            { value: 'HUMAN_HEALTH', label: 'Human Health & Wellbeing' },
            { value: 'EDUCATION', label: 'Education & Development' },
            { value: 'COMMUNITY_WELLBEING', label: 'Community Wellbeing' },
          ],
        },
      ],
    },
    {
      id: 3,
      title: 'Project Context',
      description: 'Tell us about your project',
      fields: [
        { key: 'isNewProject', label: 'Is this request for a new project or emerging need?', type: 'radio', required: false, visible: true, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
        { key: 'newProjectExplanation', label: 'New Project Explanation', type: 'textarea', placeholder: 'Please explain...', required: false, visible: true, helpText: 'Only shown if "Yes" is selected above' },
        { key: 'isCapacityIncrease', label: 'Is this request for increasing capacity or rising operations costs?', type: 'radio', required: false, visible: true, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
        { key: 'capacityExplanation', label: 'Capacity Explanation', type: 'textarea', placeholder: 'Please explain...', required: false, visible: true, helpText: 'Only shown if "Yes" is selected above' },
      ],
    },
    {
      id: 4,
      title: 'Project Overview',
      description: 'Describe your project',
      fields: [
        { key: 'projectTitle', label: 'Project Title', type: 'text', placeholder: 'e.g., Youth Literacy Initiative 2026', required: true, visible: true },
        { key: 'projectDescription', label: 'Proposed Project Description', type: 'textarea', placeholder: 'Describe your proposed project, including what you hope to accomplish and how it aligns with the Heistand Family Foundation\'s mission...', required: true, visible: true, wordLimit: 500, helpText: 'Describe your project in detail. Photos can help tell your story (attach 1-3 jpgs).' },
        { key: 'projectGoals', label: 'Project Goals', type: 'textarea', placeholder: 'Describe the goals and objectives of your project...', required: false, visible: true, wordLimit: 500, helpText: 'What are the specific goals you hope to achieve with this project?' },
      ],
    },
    {
      id: 5,
      title: 'Financial Information',
      description: 'Budget details',
      fields: [
        { key: 'totalProjectAmount', label: 'Total Dollar Amount of Project', type: 'currency', placeholder: '100000', required: true, visible: true },
        { key: 'grantRequestAmount', label: 'Grant Request Amount', type: 'currency', placeholder: '25000', required: true, visible: true },
        { key: 'budgetOutline', label: 'Proposed Project Budget Outline', type: 'textarea', placeholder: 'e.g., Staff salaries ($15,000), Program supplies ($5,000), Transportation ($3,000), Facility costs ($2,000)...', required: true, visible: true, wordLimit: 250, helpText: 'Provide a simple explanation of how the grant funds would be spent' },
      ],
    },
    {
      id: 6,
      title: 'Review & Submit',
      description: 'Final review',
      fields: [],
    },
  ],
}

export const defaultApplicationConfig: FormConfigData = {
  formType: 'APPLICATION',
  steps: [
    {
      id: 1,
      title: 'Project Overview',
      description: 'Describe your project',
      fields: [
        { key: 'projectTitle', label: 'Project Title', type: 'text', placeholder: 'Youth Literacy Program', required: true, visible: true },
        { key: 'projectDescription', label: 'Project Description', type: 'textarea', placeholder: 'Describe your project in detail...', required: true, visible: true },
        { key: 'projectGoals', label: 'Project Goals', type: 'textarea', placeholder: 'What are the specific goals of this project?', required: true, visible: true },
      ],
    },
    {
      id: 2,
      title: 'Target Population',
      description: 'Who will this project serve?',
      fields: [
        { key: 'targetPopulation', label: 'Target Population Description', type: 'textarea', placeholder: 'Describe the population you will serve...', required: true, visible: true },
        { key: 'childrenServed', label: 'Children Served', type: 'number', placeholder: '100', required: true, visible: true },
        { key: 'ageRangeStart', label: 'Age Range Start', type: 'number', placeholder: '5', required: false, visible: true },
        { key: 'ageRangeEnd', label: 'Age Range End', type: 'number', placeholder: '12', required: false, visible: true },
        { key: 'povertyIndicators', label: 'Poverty Indicators', type: 'textarea', placeholder: 'Describe how you identify children in poverty...', required: true, visible: true },
      ],
    },
    {
      id: 3,
      title: 'Demographics & Poverty Metrics',
      description: 'Demographic information',
      fields: [
        { key: 'clientDemographicDescription', label: 'Client Demographic Description', type: 'textarea', placeholder: 'Describe the demographics of the population your project serves...', required: false, visible: true },
        { key: 'childrenInPovertyImpacted', label: 'Children in Poverty Impacted', type: 'number', placeholder: 'Number of children in poverty', required: false, visible: true },
        { key: 'totalChildrenServedAnnually', label: 'Total Children Served Annually', type: 'number', placeholder: 'Total children served per year', required: false, visible: true },
      ],
    },
    {
      id: 4,
      title: 'Project Timeline',
      description: 'When and where',
      fields: [
        { key: 'projectStartDate', label: 'Start Date', type: 'date', required: true, visible: true },
        { key: 'projectEndDate', label: 'End Date', type: 'date', required: true, visible: true },
        { key: 'timelineDetails', label: 'Additional Timeline Details', type: 'textarea', placeholder: 'Provide any additional details about your project timeline, key milestones, or phases...', required: false, visible: true },
        { key: 'geographicArea', label: 'Geographic Area Served', type: 'text', placeholder: 'Area could be region, municipality, or neighborhood', required: true, visible: true },
      ],
    },
    {
      id: 5,
      title: 'Funding Request',
      description: 'Financial details',
      fields: [
        { key: 'amountRequested', label: 'Amount Requested', type: 'currency', placeholder: '25000', required: true, visible: true },
        { key: 'totalProjectBudget', label: 'Total Project Budget', type: 'currency', placeholder: '50000', required: true, visible: true },
      ],
    },
    {
      id: 6,
      title: 'Outcomes & Impact',
      description: 'Expected results',
      fields: [
        { key: 'expectedOutcomes', label: 'Expected Outcomes', type: 'textarea', placeholder: 'What outcomes do you expect from this project?', required: true, visible: true },
        { key: 'measurementPlan', label: 'Measurement Plan', type: 'textarea', placeholder: 'How will you measure and track success?', required: true, visible: true },
        { key: 'sustainabilityPlan', label: 'Sustainability Plan', type: 'textarea', placeholder: 'How will this project continue beyond the grant period?', required: true, visible: true },
      ],
    },
  ],
}
