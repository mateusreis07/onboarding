import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const departments = await prisma.systemDepartment.findMany({
      orderBy: { label: 'asc' }
    })

    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const userCount = await prisma.user.count({
          where: { department: dept.code }
        })

        return {
          ...dept,
          userCount,
          isEnumDepartment: false
        }
      })
    )

    return NextResponse.json(departmentsWithCounts)
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
    const { code, label, description } = json

    if (!/^[A-Z_]+$/.test(code)) {
      return new NextResponse("Código deve conter apenas letras maiúsculas e underscores", { status: 400 })
    }

    const department = await prisma.systemDepartment.create({
      data: {
        code,
        label,
        description: description || null,
        isActive: true,
        isSystem: false,
      }
    })

    return NextResponse.json(department)
  } catch (e: any) {
    console.error(e)
    if (e.code === 'P2002') {
      return new NextResponse("Código já existe", { status: 409 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}
