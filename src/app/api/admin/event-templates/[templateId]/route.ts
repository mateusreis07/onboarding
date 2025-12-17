import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"

export async function PUT(req: Request, { params }: { params: Promise<{ templateId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { templateId } = await params

  try {
    const json = await req.json()

    const template = await prisma.eventTemplate.update({
      where: { id: templateId },
      data: {
        title: json.title,
        description: json.description,
        eventType: json.eventType,
        dayOffset: json.dayOffset,
        startHour: json.startHour,
        startMinute: json.startMinute,
        durationMinutes: json.durationMinutes,
        location: json.location,
        meetingUrl: json.meetingUrl,
        reminderMinutesBefore: json.reminderMinutesBefore,
        role: json.role,
        mandatory: json.mandatory
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ templateId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { templateId } = await params

  try {
    await prisma.eventTemplate.delete({
      where: { id: templateId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
