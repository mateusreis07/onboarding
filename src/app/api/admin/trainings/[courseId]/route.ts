import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"
import { z } from "zod"

const updateCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  role: z.string().nullable().optional(),
  coverImage: z.string().optional(),
})

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== Role.HR && session?.user?.role !== Role.MANAGER) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { courseId } = await params

  try {
    const course = await prisma.trainingCourse.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            quiz: { include: { questions: true } }
          }
        }
      }
    })
    return NextResponse.json(course)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { courseId } = await params

  try {
    const json = await req.json()
    const body = updateCourseSchema.parse(json)

    const course = await prisma.trainingCourse.update({
      where: { id: courseId },
      data: {
        title: body.title,
        description: body.description,
        role: body.role,
        coverImage: body.coverImage
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { courseId } = await params

  try {
    // Delete modules first (cascade usually handles this but explicit is safe if DB config varies)
    // Prisma cascade deletion depends on schema. We will just delete course and let Prisma handle relations or error.
    // Schema doesn't specify onDelete: Cascade explicitly in relation, so Prisma default behavior prevents it or errors.
    // Let's delete modules first manually to be safe or use deleteMany

    const modules = await prisma.trainingModule.findMany({ where: { courseId: courseId } })
    for (const m of modules) {
      // Delete quizzes
      await prisma.trainingQuiz.deleteMany({ where: { moduleId: m.id } })
    }
    await prisma.trainingModule.deleteMany({ where: { courseId: courseId } })
    await prisma.userTraining.deleteMany({ where: { courseId: courseId } })

    await prisma.trainingCourse.delete({
      where: { id: courseId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
