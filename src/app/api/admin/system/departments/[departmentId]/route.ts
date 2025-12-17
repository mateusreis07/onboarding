import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { departmentId } = await params
  const json = await req.json()

  try {
    const existing = await prisma.systemDepartment.findUnique({
      where: { id: departmentId }
    })

    if (!existing) {
      return new NextResponse("Departamento não encontrado", { status: 404 })
    }

    const updateData: any = {
      label: json.label,
      description: json.description || null,
      isActive: json.isActive !== undefined ? json.isActive : existing.isActive,
    }

    if (!existing.isSystem && json.code) {
      if (!/^[A-Z_]+$/.test(json.code)) {
        return new NextResponse("Código deve conter apenas letras maiúsculas e underscores", { status: 400 })
      }
      updateData.code = json.code
    }

    const updated = await prisma.systemDepartment.update({
      where: { id: departmentId },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (e: any) {
    console.error(e)
    if (e.code === 'P2002') {
      return new NextResponse("Código já existe", { status: 409 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { departmentId } = await params

  try {
    const department = await prisma.systemDepartment.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      return new NextResponse("Departamento não encontrado", { status: 404 })
    }

    if (department.isSystem) {
      return new NextResponse("Departamentos do sistema não podem ser deletados", { status: 403 })
    }

    // Check if any users have this department
    const userCount = await prisma.user.count({
      where: { department: department.code }
    })

    if (userCount > 0) {
      return new NextResponse(`Não é possível deletar: ${userCount} usuário(s) neste departamento`, { status: 400 })
    }

    await prisma.systemDepartment.delete({
      where: { id: departmentId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
