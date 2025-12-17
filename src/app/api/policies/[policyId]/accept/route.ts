import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { headers } from 'next/headers'

export async function POST(req: Request, { params }: { params: Promise<{ policyId: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { policyId } = await params
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    // Audit Log: Record Acceptance
    const acceptance = await prisma.userPolicyAcceptance.create({
      data: {
        userId: session.user.id,
        policyId: policyId,
        ipAddress: Array.isArray(ip) ? ip[0] : ip,
        userAgent: userAgent,
        acceptedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, acceptance })
  } catch (error) {
    console.error("Policy acceptance error:", error)
    return new NextResponse("Internal Error or Already Accepted", { status: 500 })
  }
}
