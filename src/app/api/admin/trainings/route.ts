import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"
import { z } from "zod"

const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  role: z.string().nullable().optional(),
  coverImage: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (session?.user?.role !== Role.HR && session?.user?.role !== Role.MANAGER) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const courses = await prisma.trainingCourse.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { modules: true, userProgress: true } }
      }
    })
    return NextResponse.json(courses)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const body = createCourseSchema.parse(json)

    const course = await prisma.trainingCourse.create({
      data: {
        title: body.title,
        description: body.description,
        role: body.role,
        coverImage: body.coverImage
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}
