import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    console.log('📅 [API] Fetching events for user:', session.user.id)
    const events = await prisma.calendarEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: 'asc' }
    })

    console.log('📅 [API] Found events:', events.length)
    console.log('📅 [API] Events:', JSON.stringify(events, null, 2))

    return NextResponse.json(events)
  } catch (error) {
    console.error('❌ [API] Error:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()

    const event = await prisma.calendarEvent.create({
      data: {
        userId: session.user.id,
        title: json.title,
        description: json.description,
        eventType: json.eventType || 'CUSTOM',
        startTime: new Date(json.startTime),
        endTime: new Date(json.endTime),
        location: json.location,
        meetingUrl: json.meetingUrl,
        reminderMinutesBefore: json.reminderMinutesBefore || 30
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
