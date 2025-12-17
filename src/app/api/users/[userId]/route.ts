import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"
import { TaskStatus, TaskType } from "@prisma/client"

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  department: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  managerId: z.string().nullable().optional(),
  buddyId: z.string().nullable().optional(),
})

const assignTemplateSchema = z.object({
  templateId: z.string(),
})

// Update user information
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth()

  if (!session?.user || session.user.role !== "HR") {
    // return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { userId } = await params
    const json = await req.json()
    const body = updateUserSchema.parse(json)

    // Check if email is being changed and if it's already in use
    if (body.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email }
      })

      if (existingUser && existingUser.id !== userId) {
        return new NextResponse("Email already in use", { status: 409 })
      }
    }

    // Get current user to check if buddy changed
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { buddyId: true }
    })

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        department: body.department,
        jobTitle: body.jobTitle,
        managerId: body.managerId === "none" ? null : body.managerId,
        buddyId: body.buddyId === "none" ? null : body.buddyId,
      },
      include: {
        manager: { select: { name: true } },
        buddy: { select: { id: true, name: true } },
        onboarding: { select: { status: true, progress: true } }
      }
    })

    // Notify new Buddy if changed
    if (body.buddyId && body.buddyId !== "none" && body.buddyId !== currentUser?.buddyId) {
      await prisma.notification.create({
        data: {
          userId: body.buddyId,
          title: "Você tem um novo afilhado!",
          message: `Você foi designado como Padrinho de ${updatedUser.name}. Acompanhe o progresso dele no seu painel.`,
          type: "INFO",
          link: `/dashboard/employees`
        }
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    console.error("Error updating user:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// Assign or change onboarding template
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth()

  if (!session?.user || session.user.role !== "HR") {
    // return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { userId } = await params
    const json = await req.json()
    const body = assignTemplateSchema.parse(json)

    console.log("Assigning template:", body.templateId, "to user:", userId)

    // Check if user already has onboarding
    const existingOnboarding = await prisma.userOnboarding.findUnique({
      where: { userId },
      include: { tasks: true }
    })

    console.log("Existing onboarding:", existingOnboarding ? "found" : "not found")

    // Get the template
    const template = await prisma.onboardingTemplate.findUnique({
      where: { id: body.templateId },
      include: { tasks: true }
    })

    if (!template) {
      console.error("Template not found:", body.templateId)
      return new NextResponse("Template not found", { status: 404 })
    }

    console.log("Template found:", template.title, "with", template.tasks.length, "tasks")

    let onboarding

    if (existingOnboarding) {
      console.log("Updating existing onboarding...")
      // Delete existing tasks and create new ones from template
      await prisma.userTask.deleteMany({
        where: { onboardingId: existingOnboarding.id }
      })

      onboarding = await prisma.userOnboarding.update({
        where: { id: existingOnboarding.id },
        data: {
          status: "IN_PROGRESS",
          progress: 0,
          tasks: {
            create: template.tasks.map((t: any) => ({
              title: t.title,
              description: t.description,
              type: t.type,
              status: TaskStatus.PENDING,
              dueDate: new Date(Date.now() + t.dueDayOffset * 24 * 60 * 60 * 1000),
              originalTemplateTaskId: t.id,
              assigneeRole: t.assigneeRole
            }))
          }
        },
        include: {
          tasks: true
        }
      })

      await prisma.notification.create({
        data: {
          userId: existingOnboarding.userId,
          title: "Onboarding Atualizado",
          message: `Seu plano de onboarding foi atualizado para "${template.title}".`
        }
      })

      // Workflow: Create Documents
      const docTasks = template.tasks.filter((t: any) => t.type === TaskType.DOCUMENT_UPLOAD)
      for (const t of docTasks) {
        await prisma.document.create({
          data: {
            userId: existingOnboarding.userId,
            title: t.title,
            type: "Document",
            url: "",
            status: "PENDING"
          }
        })
      }
    } else {
      console.log("Creating new onboarding...")
      // Create new onboarding
      onboarding = await prisma.userOnboarding.create({
        data: {
          userId,
          status: "IN_PROGRESS",
          progress: 0,
          tasks: {
            create: template.tasks.map((t: any) => ({
              title: t.title,
              description: t.description,
              type: t.type,
              status: TaskStatus.PENDING,
              dueDate: new Date(Date.now() + t.dueDayOffset * 24 * 60 * 60 * 1000),
              originalTemplateTaskId: t.id,
              assigneeRole: t.assigneeRole
            }))
          }
        },
        include: {
          tasks: true
        }
      })

      await prisma.notification.create({
        data: {
          userId,
          title: "Onboarding Iniciado",
          message: `Você recebeu um novo plano de onboarding: "${template.title}".`
        }
      })

      // Workflow: Create Documents
      const docTasks = template.tasks.filter((t: any) => t.type === TaskType.DOCUMENT_UPLOAD)
      for (const t of docTasks) {
        await prisma.document.create({
          data: {
            userId,
            title: t.title,
            type: "Document",
            url: "",
            status: "PENDING"
          }
        })
      }
    }

    // Workflow: Notify IT, Facilities, and Manager about the Update/New Assignment
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user) {
      const supportStaff = await prisma.user.findMany({
        where: { role: { in: ["IT", "FACILITIES"] } }
      })

      for (const staff of supportStaff) {
        await prisma.notification.create({
          data: {
            userId: staff.id,
            title: "Onboarding Iniciado/Atualizado",
            message: `Plano de onboarding configurado para ${user.name}. Verifique as tarefas.`
          }
        })
      }

      if (user.managerId) {
        await prisma.notification.create({
          data: {
            userId: user.managerId,
            title: "Onboarding Configurado",
            message: `O plano de onboarding de ${user.name} está pronto e em andamento.`
          }
        })
      }
    }

    console.log("Onboarding assigned successfully")
    return NextResponse.json(onboarding)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    console.error("Error assigning template:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
