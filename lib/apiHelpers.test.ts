import { getSession } from "next-auth/client"
import { apiHandler, ApiRequestWithSession } from "./apiHelpers"
import { NextApiResponse } from "next"
import { mockUser } from "../fixtures/users"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { pilotGroup } from "../config/allowedGroups"

process.env.GSSO_TOKEN_NAME = "foo"
process.env.HACKNEY_JWT_SECRET = "secret"

jest.mock("next-auth/client")

const mockHandler = jest.fn()
const mockJson = jest.fn()
const mockStatus = jest.fn(() => {
  return {
    json: mockJson,
  }
})
const mockRes = {
  status: mockStatus,
}

const session = { user: mockUser };

describe("apiHandler", () => {
  beforeEach(() => {
    mockStatus.mockClear()
    mockHandler.mockClear()
    mockJson.mockClear()
    ;(getSession as jest.Mock).mockResolvedValue(session)
  })

  it("responds with an appropriate error if there is no session", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)

    await apiHandler(mockHandler)(
      {
        headers: {
          cookies: jest.fn(),
        },
        method: "GET",
      } as unknown as ApiRequestWithSession,
      mockRes as unknown as NextApiResponse
    )

    expect(mockHandler).not.toBeCalled()
    expect(mockStatus).toBeCalledWith(401)
    expect(mockJson).toBeCalledWith({
      error: "Not authenticated",
    })
  })

  describe("when user is in the pilot group", () => {
    const mockReqWithUserInPilot = {
      headers: {
        cookie: cookie.serialize(
          process.env.GSSO_TOKEN_NAME,
          jwt.sign(
            {
              groups: [pilotGroup],
            },
            process.env.HACKNEY_JWT_SECRET
          )
        ),
      },
    }

    ;["GET", "POST", "PUT", "PATCH", "DELETE"].forEach(method => {
      it(`calls the endpoint handler if HTTP method is ${method}`, async () => {
        await apiHandler(mockHandler)(
          {
            ...mockReqWithUserInPilot,
            method,
          } as unknown as ApiRequestWithSession,
          mockRes as unknown as NextApiResponse
        )

        expect(mockHandler).toBeCalledWith(
          expect.objectContaining({
            ...mockReqWithUserInPilot,
            method,
            session,
          }),
          mockRes
        )
      })
    })

    it("throws errors", async () => {
      const mockErrorHandler = jest
        .fn()
        .mockRejectedValue(new Error("example error"))

      await expect(apiHandler(mockErrorHandler)(
        mockReqWithUserInPilot as unknown as ApiRequestWithSession,
        mockRes as unknown as NextApiResponse
      )).rejects.toEqual(new Error('example error'));

      expect(mockErrorHandler).toBeCalled()
    })
  })

  describe("when user is not in the pilot group", () => {
    const mockReqWithUserNotInPilot = {
      headers: {
        cookie: cookie.serialize(
          process.env.GSSO_TOKEN_NAME,
          jwt.sign(
            {
              groups: ["some-non-pilot-group"],
            },
            process.env.HACKNEY_JWT_SECRET
          )
        ),
      },
    }

    it("calls the endpoint handler if HTTP method is GET", async () => {
      await apiHandler(mockHandler)(
        {
          ...mockReqWithUserNotInPilot,
          method: "GET",
        } as unknown as ApiRequestWithSession,
        mockRes as unknown as NextApiResponse
      )

      expect(mockHandler).toBeCalledWith(
        expect.objectContaining({
          ...mockReqWithUserNotInPilot,
          method: "GET",
          session,
        }),
        mockRes
      )
    })

    ;["POST", "PUT", "PATCH", "DELETE"].forEach(method => {
      it(`returns 403 if HTTP method is ${method}`, async () => {
        await apiHandler(mockHandler)(
          {
            ...mockReqWithUserNotInPilot,
            method,
          } as unknown as ApiRequestWithSession,
          mockRes as unknown as NextApiResponse
        )

        expect(mockStatus).toBeCalledWith(403)
        expect(mockJson).toBeCalledWith({
          error:
            "Not authorised. You are logged in, but not allowed to perform this operation.",
        })
      })
    })

    it("throws errors", async () => {
      const mockErrorHandler = jest
        .fn()
        .mockRejectedValue(new Error("example error"))

      await expect(apiHandler(mockErrorHandler)(
        {
          ...mockReqWithUserNotInPilot,
          method: "GET",
        } as unknown as ApiRequestWithSession,
        mockRes as unknown as NextApiResponse,
      )).rejects.toEqual(new Error('example error'));

      expect(mockErrorHandler).toHaveBeenCalled();
    })
  })
})
