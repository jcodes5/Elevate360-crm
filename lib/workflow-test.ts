/**
 * Workflow Execution Engine Test
 * 
 * This script demonstrates how the workflow execution engine works.
 */

import { Workflow, Contact } from "@/types"
import { WorkflowExecutionService } from "@/lib/services/workflow-execution-service"

// Example workflow
const exampleWorkflow: Workflow = {
  id: "workflow-1",
  name: "Welcome Series",
  description: "Welcome new contacts with a series of emails and tags",
  status: "active",
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
      id: "email-1",
      type: "action",
      subType: "send_email",
      name: "Send Welcome Email",
      position: { x: 300, y: 100 },
      config: {
        subject: "Welcome to our platform!",
        content: "Hello {{firstName}}, welcome to our platform!"
      },
      template: {}
    },
    {
      id: "delay-1",
      type: "action",
      subType: "delay",
      name: "Wait 1 day",
      position: { x: 500, y: 100 },
      config: {
        duration: 1,
        unit: "days"
      },
      template: {}
    },
    {
      id: "tag-1",
      type: "action",
      subType: "add_tag",
      name: "Add Customer Tag",
      position: { x: 700, y: 100 },
      config: {
        tag: "customer"
      },
      template: {}
    }
  ],
  connections: [
    {
      id: "conn-1",
      sourceNodeId: "trigger-1",
      targetNodeId: "email-1"
    },
    {
      id: "conn-2",
      sourceNodeId: "email-1",
      targetNodeId: "delay-1"
    },
    {
      id: "conn-3",
      sourceNodeId: "delay-1",
      targetNodeId: "tag-1"
    }
  ],
  organizationId: "org-1",
  createdBy: "user-1",
  metrics: {
    totalEntered: 0,
    completed: 0,
    active: 0,
    dropped: 0
  },
  createdAt: new Date(),
  updatedAt: new Date()
}

// Example contact
const exampleContact: Contact = {
  id: "contact-1",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  whatsappNumber: "+1234567890",
  company: "Example Inc.",
  position: "Manager",
  tags: [],
  leadScore: 75,
  status: "LEAD",
  source: "website",
  organizationId: "org-1",
  customFields: {},
  notes: [],
  activities: [],
  createdAt: new Date(),
  updatedAt: new Date()
}

// Test the workflow execution
async function testWorkflowExecution() {
  console.log("Starting workflow execution test...")
  
  try {
    const executionService = new WorkflowExecutionService(exampleWorkflow, exampleContact)
    await executionService.start()
    
    console.log("Workflow execution completed successfully!")
  } catch (error) {
    console.error("Error during workflow execution:", error)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWorkflowExecution()
}

export { exampleWorkflow, exampleContact, testWorkflowExecution }