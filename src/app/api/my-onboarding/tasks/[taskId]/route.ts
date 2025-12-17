import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { TaskStatus } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params
  const session = await auth()

  if (!session?.user) {
    // return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const status = json.status as TaskStatus

    const task = await prisma.userTask.update({
      where: { id: taskId },
      data: {
        status: status,
        completedAt: status === TaskStatus.COMPLETED ? new Date() : null
      }
    })

    // Recalculate progress
    const onboardingId = task.onboardingId
    const allTasks = await prisma.userTask.findMany({
      where: { onboardingId }
    })

    const total = allTasks.length
    const completed = allTasks.filter(t => t.status === TaskStatus.COMPLETED).length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    await prisma.userOnboarding.update({
      where: { id: onboardingId },
      data: {
        progress,
        status: progress === 100 ? "COMPLETED" : "IN_PROGRESS"
      }
    })

    // Workflow: Notify Manager if task completed
    if (status === TaskStatus.COMPLETED) {
      const onboarding = await prisma.userOnboarding.findUnique({
        where: { id: onboardingId },
        include: { user: { include: { manager: true } } }
      })

      if (onboarding?.user?.managerId) {
        await prisma.notification.create({
          data: {
            userId: onboarding.user.managerId,
            title: "Tarefa Concluída",
            message: `O colaborador ${onboarding.user.name} concluiu a tarefa "${task.title}".`
          }
        })
      }

      // If Onboarding completed
      console.log(`Checking completion: progress=${progress}, managerId=${onboarding?.user?.managerId}`)
      if (progress >= 100 && onboarding?.user?.managerId) {
        await prisma.notification.create({
          data: {
            userId: onboarding.user.managerId,
            title: "Onboarding Finalizado",
            message: `O colaborador ${onboarding.user.name} concluiu todas as etapas de onboarding!`
          }
        })
      }
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
