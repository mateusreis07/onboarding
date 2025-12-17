import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const jobTitles = await prisma.systemJobTitle.findMany({
      orderBy: [{ category: 'asc' }, { label: 'asc' }]
    })

    const jobTitlesWithCounts = await Promise.all(
      jobTitles.map(async (jt) => {
        const userCount = await prisma.user.count({
          where: { jobTitle: jt.code }
        })

        const templateCount = await prisma.onboardingTemplate.count({
          where: { jobTitle: jt.code }
        })

        return {
          ...jt,
          userCount,
          templateCount,
          isEnumJobTitle: false
        }
      })
    )

    return NextResponse.json(jobTitlesWithCounts)
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const { code, label, category, description } = json

    if (!/^[A-Z_]+$/.test(code)) {
      return new NextResponse("Código deve conter apenas letras maiúsculas e underscores", { status: 400 })
    }

    const jobTitle = await prisma.systemJobTitle.create({
      data: {
        code,
        label,
        category: category || null,
        description: description || null,
        isActive: true,
        isSystem: false,
      }
    })

    return NextResponse.json(jobTitle)
  } catch (e: any) {
    console.error(e)
    if (e.code === 'P2002') {
      return new NextResponse("Código já existe", { status: 409 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}
