export interface ApprovalStep {
  id: number
  name: string
  description: string
  order: number
  isRequired: boolean
}

export interface ApprovalWorkflow {
  id: number
  name: string
  description: string
  steps: ApprovalStep[]
}

// SOC approval workflow
export const socApprovalWorkflow: ApprovalWorkflow = {
  id: 3,
  name: "SOC Request Approval",
  description: "Workflow for approving Statement of Compliance requests",
  steps: [
    {
      id: 301,
      name: "Initial Review",
      description: "Initial review of the SOC request by the compliance team",
      order: 1,
      isRequired: true,
    },
    {
      id: 302,
      name: "Documentation Check",
      description: "Verification of all required documentation",
      order: 2,
      isRequired: true,
    },
    {
      id: 303,
      name: "Final Approval",
      description: "Final approval by the compliance manager",
      order: 3,
      isRequired: true,
    },
  ],
}

// Function to get approval workflow by ID
export function getApprovalWorkflowById(id: number): ApprovalWorkflow | undefined {
  if (id === 3) return socApprovalWorkflow
  return undefined
}

// Export as default and named export
export default {
  getApprovalWorkflowById,
  socApprovalWorkflow,
}
