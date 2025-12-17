import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()

  // Verify permissions
  if (!session?.user || (session.user.role !== "HR" && session.user.role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const { userId, title, description, dueDate, type } = json

    // Find active onboarding for user
    const onboarding = await prisma.userOnboarding.findFirst({
      where: { userId: userId, status: 'IN_PROGRESS' }
    })

    if (!onboarding) {
      return new NextResponse("User has no active onboarding", { status: 400 })
    }

    const newTask = await prisma.userTask.create({
      data: {
        onboardingId: onboarding.id,
        title,
        description: description || "",
        status: "PENDING",
        dueDate: dueDate ? new Date(dueDate) : null,
        type: type || "CHECKLIST", // Or TASK if Enum allows, assuming CHECKLIST is generic
      }
    })

    // Recalculate Progress
    const totalTasks = await prisma.userTask.count({ where: { onboardingId: onboarding.id } })
    const completedTasks = await prisma.userTask.count({ where: { onboardingId: onboarding.id, status: 'COMPLETED' } })
    const newProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

    await prisma.userOnboarding.update({
      where: { id: onboarding.id },
      data: { progress: newProgress }
    })

    return NextResponse.json(newTask)

  } catch (error) {
    console.error("Error creating task:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "HR" && session.user.role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const { taskId, status } = json // status: COMPLETED

    const updatedTask = await prisma.userTask.update({
      where: { id: taskId },
      data: { status }
    })

    // Recalculate Progress
    const onboardingId = updatedTask.onboardingId
    const totalTasks = await prisma.userTask.count({ where: { onboardingId } })
    const completedTasks = await prisma.userTask.count({ where: { onboardingId, status: 'COMPLETED' } })
    const newProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

    await prisma.userOnboarding.update({
      where: { id: onboardingId },
      data: { progress: newProgress }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
