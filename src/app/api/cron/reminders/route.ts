import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const now = new Date()
    // Look ahead up to 24 hours to be safe, but filter logic handles the exact timing
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Find upcoming events that have not been reminded yet
    const events = await prisma.calendarEvent.findMany({
      where: {
        startTime: {
          gt: now,
          lt: tomorrow
        },
        reminderSent: false,
        completed: false
      },
      include: {
        user: true
      }
    })

    let remindersSent = 0

    for (const event of events) {
      // Calculate minutes until event
      const minutesUntil = Math.floor((event.startTime.getTime() - now.getTime()) / (1000 * 60))

      // Check if it's time to remind (within the reminder window)
      // We add a buffer of +5 minutes to ensure we don't miss it if the job runs slightly late
      if (minutesUntil <= event.reminderMinutesBefore && minutesUntil >= -5) {

        // 1. Create Notification
        await prisma.notification.create({
          data: {
            userId: event.userId,
            title: `Lembrete: ${event.title}`,
            message: `Evento começa em ${minutesUntil} minutos. Local: ${event.location || 'Online'}`,
            type: 'REMINDER',
            link: '/dashboard/calendar'
          }
        })

        // 2. Mark as sent
        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { reminderSent: true }
        })

        remindersSent++
      }
    }

    return NextResponse.json({
      success: true,
      processed: events.length,
      remindersSent
    })
  } catch (error) {
    console.error("Error processing reminders:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
