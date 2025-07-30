import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import type { Contact } from "@/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contact = await db.findById<Contact>("contacts", params.id)

    if (!contact) {
      return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    console.error("Get contact error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    const contact = await db.updateById<Contact>("contacts", params.id, {
      ...data,
      updatedAt: new Date(),
    })

    if (!contact) {
      return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    console.error("Update contact error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await db.deleteById("contacts", params.id)

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    })
  } catch (error) {
    console.error("Delete contact error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
