import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== Role.HR && session.user.role !== Role.MANAGER)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const policies = await prisma.policy.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(policies)
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== Role.HR && session.user.role !== Role.MANAGER)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const { title, content, mandatory, version } = json

    const policy = await prisma.policy.create({
      data: {
        title,
        content,
        mandatory: mandatory || false,
        version: version || "1.0",
        isActive: true
      }
    })
    return NextResponse.json(policy)
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
