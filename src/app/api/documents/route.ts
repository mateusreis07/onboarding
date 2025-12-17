import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(documents)
  } catch (error) {
    console.error(error)
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
    const { title, url, type } = json

    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        title,
        url,
        type,
        status: "PENDING"
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
