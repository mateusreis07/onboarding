import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { ResourceCategory } from "@prisma/client"
import { Role } from "@/lib/roles"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== Role.HR && session.user.role !== Role.MANAGER)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const where = category ? { category: category as ResourceCategory } : {}

  try {
    const resources = await prisma.libraryResource.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(resources)
  } catch (e) {
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
    const resource = await prisma.libraryResource.create({
      data: {
        category: json.category,
        title: json.title,
        content: json.content || null,
        url: json.url || null,
        metadata: json.metadata || null
      }
    })
    return NextResponse.json(resource)
  } catch (e) {
    console.error(e)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
