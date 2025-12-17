import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { roleId } = await params
  const json = await req.json()

  try {
    // Check if it's a system role
    const existing = await prisma.systemRole.findUnique({
      where: { id: roleId }
    })

    if (!existing) {
      return new NextResponse("Função não encontrada", { status: 404 })
    }

    // System roles can only update label and description, not code
    const updateData: any = {
      label: json.label,
      description: json.description || null,
      isActive: json.isActive !== undefined ? json.isActive : existing.isActive,
    }

    // Only allow code change for non-system roles
    if (!existing.isSystem && json.code) {
      if (!/^[A-Z_]+$/.test(json.code)) {
        return new NextResponse("Código deve conter apenas letras maiúsculas e underscores", { status: 400 })
      }
      updateData.code = json.code
    }

    const updated = await prisma.systemRole.update({
      where: { id: roleId },
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
  { params }: { params: Promise<{ roleId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { roleId } = await params

  try {
    const role = await prisma.systemRole.findUnique({
      where: { id: roleId }
    })

    if (!role) {
      return new NextResponse("Função não encontrada", { status: 404 })
    }

    if (role.isSystem) {
      return new NextResponse("Funções do sistema não podem ser deletadas", { status: 403 })
    }

    // Check if any users have this role
    const userCount = await prisma.user.count({
      where: { role: role.code }
    })

    if (userCount > 0) {
      return new NextResponse(`Não é possível deletar: ${userCount} usuário(s) possuem esta função`, { status: 400 })
    }

    await prisma.systemRole.delete({
      where: { id: roleId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
