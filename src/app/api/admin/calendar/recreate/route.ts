import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"

// Delete all events for a user and reapply templates
export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { userId } = await req.json()

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Delete all existing events for this user
    await prisma.calendarEvent.deleteMany({
      where: { userId: userId }
    })

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

    const start = new Date(user.startDate || new Date())
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
      message: `Agenda recriada com ${createdEvents.length} eventos`
    })
  } catch (error) {
    console.error("Error recreating calendar:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
