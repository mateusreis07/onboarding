import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const policies = await prisma.policy.findMany({
      where: { isActive: true },
      include: {
        acceptances: {
          where: { userId: session.user.id }
        }
      }
    })

    // Format for frontend
    const result = policies.map(p => ({
      ...p,
      accepted: p.acceptances.length > 0,
      acceptedAt: p.acceptances[0]?.acceptedAt || null
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
