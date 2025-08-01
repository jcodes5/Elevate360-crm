import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ApiResponse } from "@/lib/models"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Contact ID is required',
        errors: [{ code: 'VALIDATION_ERROR', message: 'Contact ID parameter is missing' }],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        notes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdBy: true,
            createdAt: true
          }
        },
        activities: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            description: true,
            metadata: true,
            createdBy: true,
            createdAt: true
          }
        },
        deals: {
          select: {
            id: true,
            title: true,
            value: true,
            currency: true,
            stage: {
              select: {
                id: true,
                name: true,
                color: true
              }
            },
            pipeline: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        tasks: {
          where: {
            status: { not: 'COMPLETED' }
          },
          select: {
            id: true,
            title: true,
            priority: true,
            status: true,
            dueDate: true
          }
        },
        appointments: {
          where: {
            startTime: { gte: new Date() }
          },
          take: 5,
          orderBy: { startTime: 'asc' },
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
            type: true
          }
        }
      }
    })

    if (!contact) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Contact not found',
        errors: [{ code: 'NOT_FOUND_ERROR', message: `Contact with ID ${params.id} does not exist` }],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: contact,
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get contact error:", error)

    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to retrieve contact',
      errors: [{
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }],
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Contact ID is required',
        errors: [{ code: 'VALIDATION_ERROR', message: 'Contact ID parameter is missing' }],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const data = await request.json()

    // Validate email format if email is being updated
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        const errorResponse: ApiResponse = {
          success: false,
          message: 'Invalid email format',
          errors: [{ code: 'VALIDATION_ERROR', message: 'Please provide a valid email address' }],
          meta: {
            timestamp: new Date(),
            requestId: crypto.randomUUID(),
            version: '1.0.0',
          },
        }
        return NextResponse.json(errorResponse, { status: 400 })
      }

      // Check for duplicate email if email is being changed
      const existingContact = await prisma.contact.findFirst({
        where: {
          email: data.email.toLowerCase().trim(),
          id: { not: params.id },
          organizationId: data.organizationId
        }
      })

      if (existingContact) {
        const errorResponse: ApiResponse = {
          success: false,
          message: 'Email already exists',
          errors: [{ code: 'DUPLICATE_ERROR', message: 'Another contact with this email address already exists' }],
          meta: {
            timestamp: new Date(),
            requestId: crypto.randomUUID(),
            version: '1.0.0',
          },
        }
        return NextResponse.json(errorResponse, { status: 409 })
      }
    }

    // Prepare update data
    const updateData: any = { ...data }
    delete updateData.id
    delete updateData.createdAt
    updateData.updatedAt = new Date()

    // Clean up string fields
    if (updateData.firstName) updateData.firstName = updateData.firstName.trim()
    if (updateData.lastName) updateData.lastName = updateData.lastName.trim()
    if (updateData.email) updateData.email = updateData.email.toLowerCase().trim()
    if (updateData.phone) updateData.phone = updateData.phone.trim()
    if (updateData.company) updateData.company = updateData.company.trim()
    if (updateData.position) updateData.position = updateData.position.trim()

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Create activity record for update
    await prisma.contactActivity.create({
      data: {
        contactId: contact.id,
        type: 'TAG_ADDED',
        description: 'Contact updated',
        metadata: {
          updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
        },
        createdBy: data.updatedBy || 'system'
      }
    })

    const response: ApiResponse<any> = {
      success: true,
      data: contact,
      message: 'Contact updated successfully',
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Update contact error:", error)

    if (error.code === 'P2025') {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Contact not found',
        errors: [{ code: 'NOT_FOUND_ERROR', message: `Contact with ID ${params.id} does not exist` }],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to update contact',
      errors: [{
        code: 'UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }],
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Contact ID is required',
        errors: [{ code: 'VALIDATION_ERROR', message: 'Contact ID parameter is missing' }],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    if (!existingContact) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Contact not found',
        errors: [{ code: 'NOT_FOUND_ERROR', message: `Contact with ID ${params.id} does not exist` }],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete related activities
      await tx.contactActivity.deleteMany({
        where: { contactId: params.id }
      })

      // Delete related notes
      await tx.contactNote.deleteMany({
        where: { contactId: params.id }
      })

      // Delete related client history
      await tx.clientHistory.deleteMany({
        where: { contactId: params.id }
      })

      // Update related deals to remove contact association
      await tx.deal.updateMany({
        where: { contactId: params.id },
        data: { contactId: null }
      })

      // Update related tasks to remove contact association
      await tx.task.updateMany({
        where: { contactId: params.id },
        data: { contactId: null }
      })

      // Update related appointments to remove contact association
      await tx.appointment.updateMany({
        where: { contactId: params.id },
        data: { contactId: null }
      })

      // Finally delete the contact
      await tx.contact.delete({
        where: { id: params.id }
      })
    })

    const response: ApiResponse = {
      success: true,
      message: 'Contact deleted successfully',
      data: {
        deletedContact: {
          id: existingContact.id,
          name: `${existingContact.firstName} ${existingContact.lastName}`,
          email: existingContact.email
        }
      },
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Delete contact error:", error)

    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to delete contact',
      errors: [{
        code: 'DELETE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }],
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
