import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"

export async function GET(req: Request) {
  const session = await auth()
  if (session?.user?.role !== Role.HR && session?.user?.role !== Role.MANAGER) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const templates = await prisma.eventTemplate.findMany({
      where: { isActive: true },
      orderBy: { dayOffset: 'asc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()

    const template = await prisma.eventTemplate.create({
      data: {
        title: json.title,
        description: json.description,
        eventType: json.eventType || 'CUSTOM',
        dayOffset: json.dayOffset || 0,
        startHour: json.startHour || 9,
        startMinute: json.startMinute || 0,
        durationMinutes: json.durationMinutes || 60,
        location: json.location,
        meetingUrl: json.meetingUrl,
        reminderMinutesBefore: json.reminderMinutesBefore || 30,
        role: json.role || null,
        mandatory: json.mandatory !== false
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
