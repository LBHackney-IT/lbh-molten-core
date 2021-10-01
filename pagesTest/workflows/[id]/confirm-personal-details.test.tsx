import { GetServerSidePropsContext } from "next"
import { render, screen, waitFor, within } from "@testing-library/react"
import { mockResident } from "../../../fixtures/residents"
import {
  mockWorkflow,
  mockAuthorisedWorkflow,
} from "../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../lib/residents"
import prisma from "../../../lib/prisma"
import { useRouter } from "next/router"
import { useSession } from "next-auth/client"
import {
  getServerSideProps,
  NewWorkflowPage,
} from "../../../pages/workflows/[id]/confirm-personal-details"
import { FlashMessages } from "../../../contexts/flashMessages"
import { mockUser } from "../../../fixtures/users"

jest.mock("../../../contexts/flashMessages")
;(FlashMessages as jest.Mock).mockReturnValue(<></>)

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  query: { id: mockWorkflow.id },
})

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock("../../../lib/residents")

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

global.fetch = jest.fn().mockResolvedValue({ json: jest.fn() })

describe("<NewWorkflowPage />", () => {
  describe("when the workflow is new", () => {
    it("displays link to resident page in social care app in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({ resident: mockResident, workflow: mockWorkflow })
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))
      const residentLink = breadcrumbs.getByText(
        `${mockResident.firstName} ${mockResident.lastName}`
      )

      expect(residentLink).toBeVisible()
      expect(residentLink).toHaveAttribute(
        "href",
        `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${mockResident.mosaicId}`
      )
    })

    it("displays current page as a new workflow in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({ resident: mockResident, workflow: mockWorkflow })
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))

      expect(breadcrumbs.getByText("New workflow")).toBeVisible()
    })

    it("displays the details of the resident", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({ resident: mockResident, workflow: mockWorkflow })
        )
      )

      const warningPanel = within(screen.getByRole("heading").closest("div"))

      expect(warningPanel.getByText("Social care ID")).toBeVisible()
      expect(warningPanel.getByText(mockResident.mosaicId)).toBeVisible()
    })

    it("displays link to task list", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({ resident: mockResident, workflow: mockWorkflow })
        )
      )

      const yesLink = screen.getByText("Yes, they are correct")

      expect(yesLink).toBeVisible()
      expect(yesLink).toHaveAttribute(
        "href",
        `/workflows/${mockWorkflow.id}/steps`
      )
    })

    it("displays link to amend resident details", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({ resident: mockResident, workflow: mockWorkflow })
        )
      )

      const noLink = screen.getByText("No, amend")

      expect(noLink).toBeVisible()
      expect(noLink).toHaveAttribute(
        "href",
        `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${mockResident.mosaicId}/edit`
      )
    })

    it("displays text to confirm personal details before starting a workflow", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({
            resident: mockResident,
            workflow: mockWorkflow,
          })
        )
      )

      expect(
        screen.getByText(
          "You need to confirm these before starting a workflow."
        )
      ).toBeVisible()
    })
  })

  describe("when the workflow needs a resassessment", () => {
    it("displays link to resident page in social care app in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({
            resident: mockResident,
            workflow: mockAuthorisedWorkflow,
          })
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))
      const residentLink = breadcrumbs.getByText(
        `${mockResident.firstName} ${mockResident.lastName}`
      )

      expect(residentLink).toBeVisible()
      expect(residentLink).toHaveAttribute(
        "href",
        `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${mockResident.mosaicId}`
      )
    })

    it("displays link to workflow in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({
            resident: mockResident,
            workflow: mockAuthorisedWorkflow,
          })
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))
      const residentLink = breadcrumbs.getByText("Workflow")

      expect(residentLink).toBeVisible()
      expect(residentLink).toHaveAttribute(
        "href",
        `/workflows/${mockAuthorisedWorkflow.id}`
      )
    })

    it("displays current page as a reassessment in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({
            resident: mockResident,
            workflow: mockAuthorisedWorkflow,
          })
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))

      expect(breadcrumbs.getByText("Reassess")).toBeVisible()
    })

    it("displays the details of the resident", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({
            resident: mockResident,
            workflow: mockAuthorisedWorkflow,
          })
        )
      )

      const warningPanel = within(screen.getByRole("heading").closest("div"))

      expect(warningPanel.getByText("Social care ID")).toBeVisible()
      expect(warningPanel.getByText(mockResident.mosaicId)).toBeVisible()
    })

    it("displays link to a new reassessment", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({
            resident: mockResident,
            workflow: mockAuthorisedWorkflow,
          })
        )
      )

      const yesLink = screen.getByText("Yes, they are correct")

      expect(yesLink).toBeVisible()
      expect(yesLink).toHaveAttribute(
        "href",
        `/reviews/new?id=${mockAuthorisedWorkflow.id}`
      )
    })

    it("displays link to amend resident details", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({
            resident: mockResident,
            workflow: mockAuthorisedWorkflow,
          })
        )
      )

      const noLink = screen.getByText("No, amend")

      expect(noLink).toBeVisible()
      expect(noLink).toHaveAttribute(
        "href",
        `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${mockResident.mosaicId}/edit?redirectUrl=http://localhost/workflows/123abc"`
      )
    })

    it("displays text to confirm personal details before reassessment", async () => {
      await waitFor(() =>
        render(
          NewWorkflowPage({
            resident: mockResident,
            workflow: mockAuthorisedWorkflow,
          })
        )
      )

      expect(
        screen.getByText(
          "You need to confirm these before reassessing a workflow."
        )
      ).toBeVisible()
    })
  })
})

describe("getServerSideProps", () => {
  beforeEach(() => {
    ;(prisma.workflow.findUnique as jest.Mock).mockClear()
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    ;(getResidentById as jest.Mock).mockClear()
    ;(getResidentById as jest.Mock).mockResolvedValue(mockResident)
  })

  it("returns 404 if workflow doesn't exist", async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null)

    const response = await getServerSideProps({
      query: { id: mockWorkflow.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("redirect", { destination: "/404" })
  })

  it("returns 404 if resident doesn't exist", async () => {
    ;(getResidentById as jest.Mock).mockResolvedValue(null)

    const response = await getServerSideProps({
      query: { id: mockWorkflow.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("redirect", { destination: "/404" })
  })

  it("returns the resident as props", async () => {
    const response = await getServerSideProps({
      query: { id: mockWorkflow.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({ resident: mockResident })
    )
  })

  it("returns the workflow as JSON in props", async () => {
    const response = await getServerSideProps({
      query: { id: mockWorkflow.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        workflow: JSON.parse(JSON.stringify(mockWorkflow)),
      })
    )
  })
})