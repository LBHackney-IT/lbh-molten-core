import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../lib/apiHelpers"
import prisma from "../../../lib/prisma"
import { EditableUserValues } from "../../../types"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  switch (req.method) {
    case "PATCH": {
      if (!req.session.user.approver)
        return res
          .status(400)
          .json({ error: "You're not authorised to perform that action" })

      const values: EditableUserValues = JSON.parse(req.body)
      const users = await prisma.user.findMany()

      const changed = Object.entries(values).filter(([userId, data]) => {
        const match = users.find(user => user.id === userId)
        return (
          JSON.stringify(data) !==
          JSON.stringify({
            approver: match.approver,
            panelApprover: match.panelApprover,
            team: match.team,
          })
        )
      })

      const updates = await Promise.all(
        changed.map(([id, data]) =>
          prisma.user.update({
            where: {
              id,
            },
            data: {
              ...data,
              team: data?.team || undefined,
            },
          })
        )
      )

      res.json(updates)
      break
    }

    case "GET": {
      const users = await prisma.user.findMany()
      res.json(users)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
