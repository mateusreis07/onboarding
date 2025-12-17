import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { analyzeFeedback } from "@/lib/ai-feedback"

// GET: List feedbacks for a user (or all if HR/Manager)
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  try {
    const where: any = {}

    // If EMPLOYEE, enforce filtering by their own ID
    if (session.user.role === 'EMPLOYEE') {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        evaluator: { select: { name: true, email: true } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// POST: Create new feedback
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) { // Any auth user can theoretically give feedback? Usually Managers/HR
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const { userId, type, content } = json // content is an Object { question: answer }

    // Run AI Analysis
    const analysis = await analyzeFeedback(content)

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        evaluatorId: session.user.id,
        type,
        content: JSON.stringify(content),
        aiSummary: analysis.summary,
        sentiment: analysis.sentiment,
        score: analysis.score
      }
    })

    // Notify the user?
    await prisma.notification.create({
      data: {
        userId,
        title: "Novo Feedback Recebido",
        message: `Você recebeu um feedback de ${type.replace('_', ' ')}. Confira agora!`,
        type: "INFO",
        link: "/dashboard/feedback"
      }
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
