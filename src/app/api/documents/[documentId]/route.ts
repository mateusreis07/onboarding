import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params
  const session = await auth()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const { status, url, title } = json

    const updateData: any = {}
    if (status) updateData.status = status
    if (url) updateData.url = url
    if (title) updateData.title = title

    const document = await prisma.document.update({
      where: { id: documentId },
      data: updateData
    })

    // Workflow: Notify HR/Manager if signed
    if (status === "SIGNED") {
      // Find user's manager
      const docOwner = await prisma.user.findUnique({
        where: { id: document.userId },
        include: { manager: true }
      })

      if (docOwner?.managerId) {
        await prisma.notification.create({
          data: {
            userId: docOwner.managerId,
            title: "Documento Assinado",
            message: `O colaborador ${docOwner.name} assinou o documento "${document.title}".`
          }
        })
      }
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
