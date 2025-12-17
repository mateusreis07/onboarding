import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // If user role is EMPLOYEE, they likely don't have assigned tasks for others,
  // unless we allow peers. For now assume Role-based assignment.
  const userRole = session.user.role as string

  if (userRole === "EMPLOYEE") {
    return NextResponse.json([])
  }

  try {
    const tasks = await prisma.userTask.findMany({
      where: {
        assigneeRole: userRole,
        // Optional: filter out completed? Or user filters in UI.
        // Let's return all to show history.
      },
      include: {
        onboarding: {
          include: {
            user: {
              select: { name: true, email: true, department: true }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching assigned tasks:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
