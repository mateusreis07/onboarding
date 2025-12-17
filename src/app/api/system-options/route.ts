import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Public API to get all active system options for dropdowns
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const [roles, departments, jobTitles] = await Promise.all([
      prisma.systemRole.findMany({
        where: { isActive: true },
        orderBy: { label: 'asc' },
        select: { code: true, label: true }
      }),
      prisma.systemDepartment.findMany({
        where: { isActive: true },
        orderBy: { label: 'asc' },
        select: { code: true, label: true }
      }),
      prisma.systemJobTitle.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { label: 'asc' }],
        select: { code: true, label: true, category: true }
      })
    ])

    // Group job titles by category
    const jobTitlesByCategory: Record<string, { code: string; label: string }[]> = {}
    for (const jt of jobTitles) {
      const category = jt.category || "Outros"
      if (!jobTitlesByCategory[category]) {
        jobTitlesByCategory[category] = []
      }
      jobTitlesByCategory[category].push({ code: jt.code, label: jt.label })
    }

    return NextResponse.json({
      roles,
      departments,
      jobTitles,
      jobTitlesByCategory
    })
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
