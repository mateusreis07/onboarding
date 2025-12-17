import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  const { courseId } = await params

  try {
    // Generate Mock Certificate URL
    const certificateId = Math.random().toString(36).substring(7);
    const certUrl = `/certificates/${certificateId}.pdf`;

    const updated = await prisma.userTraining.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      },
      create: {
        userId: session.user.id,
        courseId: courseId,
        status: 'COMPLETED',
        progress: 100,
        certificateUrl: certUrl,
        completedAt: new Date()
      },
      update: {
        status: 'COMPLETED',
        progress: 100,
        certificateUrl: certUrl,
        completedAt: new Date()
      }
    })

    // Simulate LMS Integration Call
    console.log(`[LMS INTEGRATION] Syncing completion for user ${session.user.id}, course ${courseId}. Result: SUCCESS.`);

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return new NextResponse("Error", { status: 500 })
  }
}
