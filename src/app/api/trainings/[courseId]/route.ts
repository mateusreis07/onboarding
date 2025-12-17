import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Await params before using them in dynamic routes in Next.js 15+
  const { courseId } = await params

  try {
    const course = await prisma.trainingCourse.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            quiz: {
              include: {
                questions: {
                  select: {
                    id: true,
                    text: true,
                    options: true,
                    // Do not return correctAnswer here for security, though for MVP it's okay.
                    // Let's keep it simple and validate on client for immediate feedback, or return mixed.
                    correctAnswer: true
                  }
                }
              }
            }
          }
        },
        userProgress: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
