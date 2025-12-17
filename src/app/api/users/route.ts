import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "HR" && session?.user?.role !== "MANAGER") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        jobTitle: true,
        startDate: true,
        manager: {
          select: {
            id: true,
            name: true
          }
        },
        buddy: {
          select: {
            id: true,
            name: true
          }
        },
        onboarding: {
          select: {
            status: true,
            progress: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "HR" && session?.user?.role !== "MANAGER") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const { name, email, password, role, department, jobTitle, managerId, buddyId, templateId, startDate } = json

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return new NextResponse("Email already exists", { status: 400 })
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Password hashing recommended in prod
        role: role || 'EMPLOYEE',
        department,
        jobTitle,
        managerId: managerId || null,
        buddyId: buddyId || null,
        startDate: startDate ? new Date(startDate) : undefined
      }
    })

    // Assign Onboarding Template
    if (templateId) {
      const template = await prisma.onboardingTemplate.findUnique({
        where: { id: templateId },
        include: { tasks: true }
      })

      if (template) {
        const onboarding = await prisma.userOnboarding.create({
          data: {
            userId: newUser.id,
            status: 'IN_PROGRESS',
            progress: 0
          }
        })

        // Copy Tasks
        if (template.tasks.length > 0) {
          // Calculate due dates logic could be here
          const tasksData = template.tasks.map(t => ({
            onboardingId: onboarding.id,
            title: t.title,
            description: t.description,
            type: t.type,
            status: 'PENDING',
            originalTemplateTaskId: t.id,
            // Mock logic for due date: Start Date + Offset
            dueDate: startDate
              ? new Date(new Date(startDate).getTime() + (t.dueDayOffset * 24 * 60 * 60 * 1000))
              : new Date(Date.now() + (t.dueDayOffset * 24 * 60 * 60 * 1000))
          }))

          // Prisma createMany is not supported for SQLite? It IS supported in newer versions.
          // Assuming it works or use loop.
          for (const task of tasksData) {
            // Type hack for TaskStatus/Type Enums if needed, but Prisma handles strings matching enums usually.
            // However, we need to be careful with Enum types.
            await prisma.userTask.create({ data: task as any })
          }
        }
      }
    }

    // Notify Buddy
    if (buddyId) {
      await prisma.notification.create({
        data: {
          userId: buddyId,
          title: "Você foi designado como Padrinho!",
          message: `Você foi escolhido para ser o padrinho de ${name}. Acompanhe o processo de onboarding dele e ajude-o em sua jornada.`,
          type: "INFO",
          link: `/dashboard/employees`
        }
      })
    }

    return NextResponse.json(newUser)
  } catch (error) {
    console.error("Error creating user:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
