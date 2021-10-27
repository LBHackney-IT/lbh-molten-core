const { createReportingConfig } = require("./create-reporting-config")
const fs = require("fs")

jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
}))

jest.mock("../config/forms/forms.json", () => {
  const { mockForms } = require("../fixtures/form")

  return mockForms
})

const jsonStringify = jest.spyOn(JSON, "stringify")

const consoleLog = console.log
const consoleError = console.error

beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.log = consoleLog
  console.error = consoleError
})

describe("createReportingConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("creates config for staging", () => {
    createReportingConfig()

    expect(jsonStringify.mock.calls[0][0]).toEqual(
      expect.objectContaining({ stg: expect.anything() })
    )
  })

  it("creates config for production", () => {
    createReportingConfig()

    expect(jsonStringify.mock.calls[0][0]).toEqual(
      expect.objectContaining({ prod: expect.anything() }),
      null,
      expect.anything()
    )
  })

  it("writes to a file within the config folder", () => {
    createReportingConfig()

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("./config/"),
      expect.anything()
    )
  })

  it("logs that config was created", () => {
    createReportingConfig()

    expect(console.log).toHaveBeenCalledWith("✅  Created reporting config!")
  });

  describe("for staging", () => {
    it("creates a report for each form", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({ name: "mock-form" }),
            expect.objectContaining({ name: "mock-form-2" }),
            expect.objectContaining({ name: "mock-form-3" }),
          ]),
        })
      )
    })

    it("uses the workflows table for each report", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({ entity: "workflow" }),
            expect.objectContaining({ entity: "workflow" }),
            expect.objectContaining({ entity: "workflow" }),
          ]),
        })
      )
    })

    it("sets the spreadsheet ID for each report", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({ spreadsheetId: expect.anything() }),
            expect.objectContaining({ spreadsheetId: expect.anything() }),
            expect.objectContaining({ spreadsheetId: expect.anything() }),
          ]),
        })
      )
    })

    it("sets the sheet ID for each report", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({ sheetId: expect.anything() }),
            expect.objectContaining({ sheetId: expect.anything() }),
            expect.objectContaining({ sheetId: expect.anything() }),
          ]),
        })
      )
    })

    it("sets the query for each report", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({ query: {} }),
            expect.objectContaining({ query: {} }),
            expect.objectContaining({ query: {} }),
          ]),
        })
      )
    })
    ;[
      "id",
      "type",
      "formId",
      "socialCareId",
      "heldAt",
      "teamAssignedTo",
      "assignedTo",
      "createdAt",
      "createdBy",
      "submittedAt",
      "submittedBy",
      "managerApprovedAt",
      "managerApprovedBy",
      "needsPanelApproval",
      "panelApprovedAt",
      "panelApprovedBy",
      "discardedAt",
      "discardedBy",
      "updatedAt",
      "updatedBy",
    ].forEach(column => {
      it(`asks for the ${column} column in a workflow`, () => {
        createReportingConfig()

        expect(jsonStringify.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            stg: expect.arrayContaining([
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
            ]),
          })
        )
      })
    })

    it("asks for all the properties in the answers column of a workflow", () => {
      const answersColumns = [
        "answers.mock-step.mock-question",
        "answers.mock-step-2.mock-question-2",
        "answers.mock-step-3.mock-question-3",
      ]

      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
          ]),
        })
      )
    })
  })

  describe("for production", () => {
    it("creates a report for each form", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({ name: "mock-form" }),
            expect.objectContaining({ name: "mock-form-2" }),
            expect.objectContaining({ name: "mock-form-3" }),
          ]),
        })
      )
    })

    it("uses the workflows table for each report", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({ entity: "workflow" }),
            expect.objectContaining({ entity: "workflow" }),
            expect.objectContaining({ entity: "workflow" }),
          ]),
        })
      )
    })

    it("sets the spreadsheet ID for each report", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({ spreadsheetId: expect.anything() }),
            expect.objectContaining({ spreadsheetId: expect.anything() }),
            expect.objectContaining({ spreadsheetId: expect.anything() }),
          ]),
        })
      )
    })

    it("sets the sheet ID for each report", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({ sheetId: expect.anything() }),
            expect.objectContaining({ sheetId: expect.anything() }),
            expect.objectContaining({ sheetId: expect.anything() }),
          ]),
        })
      )
    })

    it("sets the query for each report", () => {
      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({ query: {} }),
            expect.objectContaining({ query: {} }),
            expect.objectContaining({ query: {} }),
          ]),
        })
      )
    })
    ;[
      "id",
      "type",
      "formId",
      "socialCareId",
      "heldAt",
      "teamAssignedTo",
      "assignedTo",
      "createdAt",
      "createdBy",
      "submittedAt",
      "submittedBy",
      "managerApprovedAt",
      "managerApprovedBy",
      "needsPanelApproval",
      "panelApprovedAt",
      "panelApprovedBy",
      "discardedAt",
      "discardedBy",
      "updatedAt",
      "updatedBy",
    ].forEach(column => {
      it(`asks for the ${column} column in a workflow`, () => {
        createReportingConfig()

        expect(jsonStringify.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            prod: expect.arrayContaining([
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
            ]),
          })
        )
      })
    })

    it("asks for all the properties in the answers column of a workflow", () => {
      const answersColumns = [
        "answers.mock-step.mock-question",
        "answers.mock-step-2.mock-question-2",
        "answers.mock-step-3.mock-question-3",
      ]

      createReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
          ]),
        })
      )
    })
  })
})