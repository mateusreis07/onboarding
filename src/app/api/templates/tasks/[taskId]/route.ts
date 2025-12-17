import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params
  const session = await auth()

  if (!session?.user || session.user.role !== Role.HR) {
    // return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    await prisma.templateTask.delete({
      where: { id: taskId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
