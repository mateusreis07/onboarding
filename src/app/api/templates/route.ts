import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const createTemplateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user || session.user.role !== "HR") {
    // return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const templates = await prisma.onboardingTemplate.findMany({
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user || session.user.role !== "HR") {
    // return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const body = createTemplateSchema.parse(json)

    const template = await prisma.onboardingTemplate.create({
      data: {
        title: body.title,
        description: body.description,
        jobTitle: body.jobTitle,
        department: body.department
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}
