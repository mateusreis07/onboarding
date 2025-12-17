import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"

// Apply event templates to a user based on their role
export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== Role.HR && session?.user?.role !== Role.MANAGER) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    let { userId, startDate } = body

    // If userId is "CURRENT_USER", use the logged-in user
    if (userId === "CURRENT_USER") {
      userId = session.user.id
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get applicable templates (general + role-specific)
    const templates = await prisma.eventTemplate.findMany({
      where: {
        isActive: true,
        OR: [
          { role: null },  // General templates
          { role: user.role }  // Role-specific templates
        ]
      },
      orderBy: { dayOffset: 'asc' }
    })

    const start = new Date(startDate || user.startDate || new Date())
    const createdEvents = []

    for (const template of templates) {
      // Calculate event date
      const eventDate = new Date(start)
      eventDate.setDate(eventDate.getDate() + template.dayOffset)
      eventDate.setHours(template.startHour, template.startMinute, 0, 0)

      const endDate = new Date(eventDate)
      endDate.setMinutes(endDate.getMinutes() + template.durationMinutes)

      const event = await prisma.calendarEvent.create({
        data: {
          userId: userId,
          title: template.title,
          description: template.description,
          eventType: template.eventType as any,
          startTime: eventDate,
          endTime: endDate,
          location: template.location,
          meetingUrl: template.meetingUrl,
          reminderMinutesBefore: template.reminderMinutesBefore
        }
      })

      createdEvents.push(event)
    }

    return NextResponse.json({
      success: true,
      count: createdEvents.length,
      events: createdEvents
    })
  } catch (error) {
    console.error("Error applying templates:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
