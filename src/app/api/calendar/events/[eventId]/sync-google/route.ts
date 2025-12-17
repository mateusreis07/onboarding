import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Sync event to Google Calendar (Mock implementation - would use Google Calendar API)
export async function POST(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { eventId } = await params

  try {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    })

    if (!event || event.userId !== session.user.id) {
      return new NextResponse("Event not found", { status: 404 })
    }

    // Mock Google Calendar API Integration
    // In production, you would:
    // 1. Use Google Calendar API with OAuth2
    // 2. Create event via: calendar.events.insert()
    // 3. Store the returned event ID

    const mockGoogleEventId = `google_${Math.random().toString(36).substring(7)}`

    await prisma.calendarEvent.update({
      where: { id: eventId },
      data: { googleEventId: mockGoogleEventId }
    })

    console.log(`[GOOGLE CALENDAR INTEGRATION] Event "${event.title}" synced. Mock ID: ${mockGoogleEventId}`)

    return NextResponse.json({
      success: true,
      googleEventId: mockGoogleEventId,
      message: "Evento sincronizado com Google Calendar (simulado)"
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
