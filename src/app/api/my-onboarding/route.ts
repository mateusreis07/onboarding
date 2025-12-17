import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    // return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: session!.user!.id },
      include: {
        tasks: {
          where: {
            OR: [
              { assigneeRole: "EMPLOYEE" },
              { assigneeRole: null }
            ]
          },
          orderBy: { dueDate: 'asc' }
        }
      }
    })

    return NextResponse.json(onboarding)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
