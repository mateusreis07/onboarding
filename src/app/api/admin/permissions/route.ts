import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Role } from "@/lib/roles"
import { seedPermissions } from "@/lib/permissions"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  await seedPermissions()

  const permissions = await prisma.rolePermission.findMany()
  return NextResponse.json(permissions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.HR) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { role, permission, enabled } = await req.json()

    if (enabled) {
      await prisma.rolePermission.create({
        data: { role, permission }
      }).catch(() => { }) // Ignore if exists
    } else {
      // Delete if exists
      await prisma.rolePermission.deleteMany({
        where: { role, permission }
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return new NextResponse("Error", { status: 500 })
  }
}
