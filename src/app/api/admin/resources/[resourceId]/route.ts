import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"

export async function DELETE(req: Request, { params }: { params: Promise<{ resourceId: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== Role.HR && session.user.role !== Role.MANAGER)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const { resourceId } = await params

  try {
    await prisma.libraryResource.delete({ where: { id: resourceId } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ resourceId: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== Role.HR && session.user.role !== Role.MANAGER)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const { resourceId } = await params
  const json = await req.json()

  try {
    const updated = await prisma.libraryResource.update({
      where: { id: resourceId },
      data: {
        title: json.title,
        content: json.content,
        url: json.url,
        metadata: json.metadata
      }
    })
    return NextResponse.json(updated)
  } catch (e) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
