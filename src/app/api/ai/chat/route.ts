import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { processChatRequest } from "@/lib/ai-assistant"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { message, history } = await req.json()

    if (!message) {
      return new NextResponse("Message is required", { status: 400 })
    }

    const response = await processChatRequest(message, history || [])

    return NextResponse.json({ response })
  } catch (error) {
    console.error("AI Chat Error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
