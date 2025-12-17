import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobtitleId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { jobtitleId } = await params
  const json = await req.json()

  try {
    const existing = await prisma.systemJobTitle.findUnique({
      where: { id: jobtitleId }
    })

    if (!existing) {
      return new NextResponse("Cargo não encontrado", { status: 404 })
    }

    const updateData: any = {
      label: json.label,
      category: json.category || null,
      description: json.description || null,
      isActive: json.isActive !== undefined ? json.isActive : existing.isActive,
    }

    if (!existing.isSystem && json.code) {
      if (!/^[A-Z_]+$/.test(json.code)) {
        return new NextResponse("Código deve conter apenas letras maiúsculas e underscores", { status: 400 })
      }
      updateData.code = json.code
    }

    const updated = await prisma.systemJobTitle.update({
      where: { id: jobtitleId },
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
  { params }: { params: Promise<{ jobtitleId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { jobtitleId } = await params

  try {
    const jobTitle = await prisma.systemJobTitle.findUnique({
      where: { id: jobtitleId }
    })

    if (!jobTitle) {
      return new NextResponse("Cargo não encontrado", { status: 404 })
    }

    if (jobTitle.isSystem) {
      return new NextResponse("Cargos do sistema não podem ser deletados", { status: 403 })
    }

    // Check if any users have this jobtitle
    const userCount = await prisma.user.count({
      where: { jobTitle: jobTitle.code }
    })

    if (userCount > 0) {
      return new NextResponse(`Não é possível deletar: ${userCount} usuário(s) usam este cargo`, { status: 400 })
    }

    // Templates use string, so check anyway
    const templateCount = await prisma.onboardingTemplate.count({
      where: { jobTitle: jobTitle.code }
    })

    if (templateCount > 0) {
      return new NextResponse(`Não é possível deletar: ${templateCount} template(s) usam este cargo`, { status: 400 })
    }

    await prisma.systemJobTitle.delete({
      where: { id: jobtitleId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
