import { Workflow } from "@prisma/client"
import { mockUser } from "./users"

export const mockWorkflow: Workflow = {
  id: "123abc",
  type: "Full",
  createdAt: new Date("October 13, 2020 14:00:00"),
  createdBy: "foo.bar@hackney.gov.uk",
  assignedTo: "foo.bar@hackney.gov.uk",
  updatedAt: new Date("October 13, 2020 14:00:00"),
  answers: {},
  socialCareId: "123",
  reviewOf: null,
  submittedAt: null,
  submittedBy: null,
  managerApprovedAt: null,
  managerApprovedBy: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
  discardedAt: null,
  discardedBy: null,
}

export const mockWorkflowWithCreator = {
  ...mockWorkflow,
  creator: mockUser,
}
