import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"

export async function DELETE(req: Request, { params }: { params: Promise<{ policyId: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== Role.HR && session.user.role !== Role.MANAGER)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const { policyId } = await params

  try {
    await prisma.policy.delete({ where: { id: policyId } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ policyId: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== Role.HR && session.user.role !== Role.MANAGER)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const { policyId } = await params
  const json = await req.json()

  try {
    // Only allow updating specific fields
    const { title, content, mandatory, version, isActive } = json
    const updated = await prisma.policy.update({
      where: { id: policyId },
      data: { title, content, mandatory, version, isActive }
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
