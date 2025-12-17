import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Fetch all courses, highlighting those assigned to the user or matching their role
    // For simplicity, we fetch all relevant courses.
    const courses = await prisma.trainingCourse.findMany({
      where: {
        OR: [
          { role: null }, // General courses
          { role: session.user.role } // Role specific
        ]
      },
      include: {
        _count: { select: { modules: true } },
        userProgress: {
          where: { userId: session.user.id },
          select: { status: true, progress: true, certificateUrl: true }
        }
      }
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
