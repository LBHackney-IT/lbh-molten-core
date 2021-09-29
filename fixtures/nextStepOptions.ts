import { NextStepOption } from "../types"

export const mockNextStepOptions: NextStepOption[] = [
  {
    id: "email-and-workflow-on-approval",
    title: "Example next step",
    description: "Next step description goes here",
    email: "example@email.com",
    formIds: ["mock-form"],
    workflowToStart: "mock-form",
    createForDifferentPerson: true,
    handoverNote: true,
    waitForApproval: true,
  },
  {
    id: "on-approval-only",
    title: "Example next step 2",
    description: "Next step description 2 goes here",
    email: null,
    formIds: ["mock-form"],
    workflowToStart: null,
    createForDifferentPerson: false,
    handoverNote: false,
    waitForApproval: false,
  },
  {
    id: "email-only",
    title: "Example next step 3",
    description: "Next step description goes here",
    email: "example@email.com",
    formIds: ["mock-form"],
    workflowToStart: null,
    createForDifferentPerson: true,
    handoverNote: true,
    waitForApproval: false,
  },
]
