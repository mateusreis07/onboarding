import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"
import { TaskType } from "@prisma/client"

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(TaskType).optional(),
  dueDayOffset: z.coerce.number().min(0).optional(),
  assigneeRole: z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params
  const session = await auth()

  if (!session?.user || session.user.role !== "HR") {
    // return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const body = createTaskSchema.parse(json)

    const task = await prisma.templateTask.create({
      data: {
        templateId: templateId,
        title: body.title,
        description: body.description,
        type: body.type || TaskType.CHECKLIST,
        dueDayOffset: body.dueDayOffset || 0,
        assigneeRole: body.assigneeRole,
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params
  const session = await auth()

  // Allow HR to see tasks for editing. Potentially Managers too.
  if (!session?.user) {
    // return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const tasks = await prisma.templateTask.findMany({
      where: { templateId: templateId },
      orderBy: { dueDayOffset: 'asc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
