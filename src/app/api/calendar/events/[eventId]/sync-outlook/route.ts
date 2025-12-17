import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Sync event to Outlook Calendar (Mock implementation)
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

    // Mock Outlook Calendar API Integration
    // In production, you would:
    // 1. Use Microsoft Graph API with OAuth2
    // 2. Create event via: POST /me/events
    // 3. Store the returned event ID

    const mockOutlookEventId = `outlook_${Math.random().toString(36).substring(7)}`

    await prisma.calendarEvent.update({
      where: { id: eventId },
      data: { outlookEventId: mockOutlookEventId }
    })

    console.log(`[OUTLOOK CALENDAR INTEGRATION] Event "${event.title}" synced. Mock ID: ${mockOutlookEventId}`)

    return NextResponse.json({
      success: true,
      outlookEventId: mockOutlookEventId,
      message: "Evento sincronizado com Outlook Calendar (simulado)"
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
