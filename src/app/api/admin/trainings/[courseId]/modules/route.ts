import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"
import { z } from "zod"

const createModuleSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  order: z.number().int().default(0),
  quiz: z.object({
    questions: z.array(z.object({
      text: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number()
    }))
  }).optional().nullable()
})

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { courseId } = await params

  try {
    const json = await req.json()
    const body = createModuleSchema.parse(json)

    const moduleData: any = {
      courseId: courseId,
      title: body.title,
      content: body.content,
      videoUrl: body.videoUrl,
      order: body.order
    }

    if (body.quiz && body.quiz.questions && body.quiz.questions.length > 0) {
      moduleData.quiz = {
        create: {
          questions: {
            create: body.quiz.questions.map(q => ({
              text: q.text,
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer
            }))
          }
        }
      }
    }

    const module = await prisma.trainingModule.create({
      data: moduleData,
      include: { quiz: { include: { questions: true } } }
    })

    return NextResponse.json(module)
  } catch (error) {
    console.error("Error creating module:", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}
