import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  const { courseId } = await params

  try {
    // Check if progress exists
    const existing = await prisma.userTraining.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (!existing) {
      // Enroll
      await prisma.userTraining.create({
        data: {
          userId: session.user.id,
          courseId: courseId,
          status: 'IN_PROGRESS',
          progress: 0
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return new NextResponse("Error", { status: 500 })
  }
}
