import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ templateId: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const { templateId } = await params

  const template = await prisma.onboardingTemplate.findUnique({
    where: { id: templateId }
  })

  if (!template) return new NextResponse("Not Found", { status: 404 })

  return NextResponse.json(template)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ templateId: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const { templateId } = await params
  const json = await req.json()
  const { title, description, jobTitle, department } = json

  try {
    const updated = await prisma.onboardingTemplate.update({
      where: { id: templateId },
      data: { title, description, jobTitle, department }
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error("Error updating template:", e)
    return new NextResponse("Error updating template", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ templateId: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "HR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const { templateId } = await params

  try {
    // Delete related tasks first to avoid constraint errors if no cascade
    await prisma.templateTask.deleteMany({
      where: { templateId: templateId }
    })

    await prisma.onboardingTemplate.delete({
      where: { id: templateId }
    })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error("Error deleting template:", e)
    return new NextResponse("Error deleting template", { status: 500 })
  }
}
