import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const departmentTranslations: Record<string, string> = {
  "ENGINEERING": "Engenharia",
  "SALES": "Vendas",
  "MARKETING": "Marketing",
  "HR": "RH",
  "FINANCE": "Financeiro",
  "OPERATIONS": "Operações"
}

export async function GET(req: Request) {
  const session = await auth()

  if (session?.user?.role !== "HR" && session?.user?.role !== "MANAGER") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // 1. Get all employees with onboarding data
    const usersOnboarding = await prisma.user.findMany({
      where: {
        onboarding: { isNot: null } // Only started onboardings
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        startDate: true,
        onboarding: {
          select: {
            progress: true,
            status: true,
            tasks: {
              select: {
                id: true,
                status: true,
                dueDate: true,
                title: true
              }
            }
          }
        }
      }
    })

    // 2. Process data
    let totalOnboarding = 0
    let totalCompleted = 0
    let totalDelayed = 0

    // Status per department
    const departmentStats: Record<string, { total: number, completed: number, delayed: number, avgProgress: number }> = {}

    // Detailed list for tables
    const employeesList = []

    for (const user of usersOnboarding) {
      if (!user.onboarding) continue;

      totalOnboarding++
      const progress = user.onboarding.progress

      // Check delay: Any task overdue OR general status delayed?
      // Assuming tasks have dueDates handled by another crob job or we check here on fly
      const hasOverdueTasks = user.onboarding.tasks.some(t => {
        // Simple check: if status is OVERDUE or (PENDING and past due date)
        if (t.status === 'OVERDUE') return true
        if (t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < new Date()) return true
        return false
      })

      const isDelayed = hasOverdueTasks
      if (isDelayed) totalDelayed++

      if (progress === 100) totalCompleted++

      // Department Stats
      const deptName = departmentTranslations[user.department || ""] || user.department || "Sem Departamento"
      if (!departmentStats[deptName]) {
        departmentStats[deptName] = { total: 0, completed: 0, delayed: 0, avgProgress: 0 }
      }
      departmentStats[deptName].total += 1
      departmentStats[deptName].avgProgress += progress
      if (progress === 100) departmentStats[deptName].completed += 1
      if (isDelayed) departmentStats[deptName].delayed += 1

      // Add to list
      employeesList.push({
        id: user.id,
        name: user.name,
        email: user.email,
        department: deptName,
        progress: progress,
        status: isDelayed ? 'DELAYED' : (progress === 100 ? 'COMPLETED' : 'IN_PROGRESS'),
        pendingTasksCount: user.onboarding.tasks.filter(t => t.status !== 'COMPLETED').length,
        nextTaskDue: user.onboarding.tasks.find(t => t.status !== 'COMPLETED')?.dueDate,
        overdueCount: user.onboarding.tasks.filter(t => {
          if (t.status === 'OVERDUE') return true
          if (t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < new Date()) return true
          return false
        }).length,
        tasks: user.onboarding.tasks.map(t => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          status: t.status
        }))
      })
    }

    // Finalize department averages
    Object.keys(departmentStats).forEach(key => {
      if (departmentStats[key].total > 0) {
        departmentStats[key].avgProgress = Math.round(departmentStats[key].avgProgress / departmentStats[key].total)
      }
    })

    return NextResponse.json({
      overview: {
        total: totalOnboarding,
        completed: totalCompleted,
        active: totalOnboarding - totalCompleted,
        delayed: totalDelayed,
        avgProgress: totalOnboarding > 0
          ? Math.round(usersOnboarding.reduce((acc, u) => acc + (u.onboarding?.progress || 0), 0) / totalOnboarding)
          : 0
      },
      byDepartment: departmentStats,
      employees: employeesList.sort((a, b) => {
        // Sort by delayed first, then by lowest progress
        if (a.status === 'DELAYED' && b.status !== 'DELAYED') return -1
        if (a.status !== 'DELAYED' && b.status === 'DELAYED') return 1
        return a.progress - b.progress
      })
    })

  } catch (error) {
    console.error("Analytics Error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
