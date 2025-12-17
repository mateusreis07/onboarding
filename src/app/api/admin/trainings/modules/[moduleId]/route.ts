import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"
import { z } from "zod"

const updateModuleSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  order: z.number().int().optional(),
  quiz: z.object({
    questions: z.array(z.object({
      text: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number()
    }))
  }).optional().nullable()
})

// ...

export async function PUT(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { moduleId } = await params

  try {
    const json = await req.json()
    const body = updateModuleSchema.parse(json)

    // Handle Quiz Update (Simple replacement strategy)
    // 1. Delete existing quiz (cascade will delete questions, but let's be safe)
    // Actually, quiz is unique per module.

    if (body.quiz !== undefined) {
      // If null, delete quiz
      if (body.quiz === null) {
        const existingQuiz = await prisma.trainingQuiz.findUnique({ where: { moduleId } })
        if (existingQuiz) {
          await prisma.question.deleteMany({ where: { quizId: existingQuiz.id } })
          await prisma.trainingQuiz.delete({ where: { id: existingQuiz.id } })
        }
      } else {
        // Upsert Quiz
        // Simple way: delete old questions, update quiz, create new questions
        const quiz = await prisma.trainingQuiz.upsert({
          where: { moduleId },
          create: { moduleId },
          update: {}
        })

        // Replace questions
        await prisma.question.deleteMany({ where: { quizId: quiz.id } })
        await prisma.question.createMany({
          data: body.quiz.questions.map(q => ({
            quizId: quiz.id,
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer
          }))
        })
      }
    }

    const module = await prisma.trainingModule.update({
      where: { id: moduleId },
      data: {
        title: body.title,
        content: body.content,
        videoUrl: body.videoUrl,
        order: body.order
      },
      include: { quiz: { include: { questions: true } } }
    })

    return NextResponse.json(module)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { moduleId } = await params

  try {
    await prisma.trainingModule.delete({
      where: { id: moduleId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
