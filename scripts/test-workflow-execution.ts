#!/usr/bin/env node
/**
 * Test script for workflow execution engine
 * 
 * This script tests the workflow execution functionality.
 */

import { Workflow, Contact } from "@/types"
import { WorkflowExecutionService } from "@/lib/services/workflow-execution-service"
import { prisma } from "@/lib/database-prisma"

async function runTest() {
  try {
    console.log('Starting workflow execution test...')
    
    // Create a test organization
    const organization = await prisma.organization.create({
      data: {
        name: "Test Organization",
        settings: {},
        subscription: {}
      }
    })
    
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        password: "password123",
        role: "ADMIN",
        organization: {
          connect: {
            id: organization.id
          }
        }
      }
    })
    
    // Create a test contact
    const contact: Contact = await prisma.contact.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        status: "LEAD",
        source: "test",
        tags: [],
        leadScore: 0,
        customFields: {},
        organization: {
          connect: {
            id: organization.id
          }
        }
      }
    }) as Contact
    
    // Create a test workflow
    const workflow: Workflow = await prisma.workflow.create({
      data: {
        name: "Test Workflow",
        status: "ACTIVE",
        trigger: {
          type: "contact_created",
          conditions: {}
        },
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            subType: "contact_created",
            name: "Contact Created",
            position: { x: 100, y: 100 },
            config: {},
            template: {}
          },
          {
            id: "action-1",
            type: "action",
            subType: "send_email",
            name: "Send Welcome Email",
            position: { x: 300, y: 100 },
            config: {
              subject: "Welcome!",
              content: "Welcome to our platform!"
            },
            template: {}
          }
        ],
        connections: [
          {
            id: "conn-1",
            sourceNodeId: "trigger-1",
            targetNodeId: "action-1"
          }
        ],
        metrics: {
          totalEntered: 0,
          completed: 0,
          active: 0,
          dropped: 0
        },
        organization: {
          connect: {
            id: organization.id
          }
        },
        creator: {
          connect: {
            id: user.id
          }
        }
      }
    }) as Workflow
    
    // Execute the workflow
    const executionService = new WorkflowExecutionService(workflow, contact)
    await executionService.start()
    
    console.log('Workflow execution test completed successfully!')
    
    // Clean up test data
    await prisma.workflow.delete({
      where: {
        id: workflow.id
      }
    })
    
    await prisma.contact.delete({
      where: {
        id: contact.id
      }
    })
    
    await prisma.user.delete({
      where: {
        id: user.id
      }
    })
    
    await prisma.organization.delete({
      where: {
        id: organization.id
      }
    })
    
    console.log('Test data cleaned up successfully!')
  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest()
}