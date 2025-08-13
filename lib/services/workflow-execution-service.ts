import { Workflow, WorkflowNode, WorkflowConnection, Contact } from "@/types"
import { db } from "@/lib/database"
import { prisma } from "@/lib/database-prisma"
import { WorkflowExecutionDBService } from "@/lib/services/workflow-execution-db-service"
import { WorkflowExecution, WorkflowExecutionStep } from "@/lib/models"

export class WorkflowExecutionService {
  private workflow: Workflow
  private contact: Contact
  private currentNodeId: string | null = null
  private executionId: string | null = null

  constructor(workflow: Workflow, contact: Contact) {
    this.workflow = workflow
    this.contact = contact
  }

  /**
   * Start executing the workflow from the trigger node
   */
  async start(): Promise<void> {
    try {
      // Find the trigger node
      const triggerNode = this.workflow.nodes.find(node => node.type === "trigger")
      
      if (!triggerNode) {
        throw new Error("No trigger node found in workflow")
      }

      // Create workflow execution record
      const execution = await WorkflowExecutionDBService.createExecution({
        workflowId: this.workflow.id,
        contactId: this.contact.id,
        nodeId: triggerNode.id,
        status: "running",
        startedAt: new Date(),
        organizationId: this.workflow.organizationId
      })
      
      this.executionId = execution.id

      // Update workflow metrics
      await this.updateWorkflowMetrics("totalEntered")

      // Start execution from trigger node
      this.currentNodeId = triggerNode.id
      await this.executeNode(triggerNode)
    } catch (error) {
      console.error("Error starting workflow execution:", error)
      // Update execution status to failed
      if (this.executionId) {
        await WorkflowExecutionDBService.updateExecution(this.executionId, {
          status: "failed",
          errorMessage: (error as Error).message,
          completedAt: new Date()
        })
      }
      throw error
    }
  }

  /**
   * Execute a specific node in the workflow
   */
  private async executeNode(node: WorkflowNode): Promise<void> {
    let step: WorkflowExecutionStep | null = null
    
    try {
      // Create execution step record
      step = await WorkflowExecutionDBService.createExecutionStep({
        executionId: this.executionId!,
        nodeId: node.id,
        status: "running",
        startedAt: new Date(),
        inputData: node.config
      })
      
      switch (node.subType) {
        case "send_email":
          await this.executeEmailAction(node)
          break
        case "send_sms":
          await this.executeSMSAction(node)
          break
        case "add_tag":
          await this.executeTagAction(node)
          break
        case "delay":
          // Delays are handled by the scheduler
          break
        default:
          console.warn(`Unknown node subtype: ${node.subType}`)
      }
      
      // Update step status to completed
      if (step) {
        await WorkflowExecutionDBService.updateExecutionStep(step.id, {
          status: "completed",
          completedAt: new Date(),
          outputData: { success: true }
        })
      }

      // Move to next node(s)
      await this.proceedToNextNodes(node.id)
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error)
      
      // Update step status to failed
      if (step) {
        await WorkflowExecutionDBService.updateExecutionStep(step.id, {
          status: "failed",
          completedAt: new Date(),
          errorMessage: (error as Error).message
        })
      }
      
      // Update workflow metrics for dropped contacts
      await this.updateWorkflowMetrics("dropped")
      
      // Update execution status to failed
      if (this.executionId) {
        await WorkflowExecutionDBService.updateExecution(this.executionId, {
          status: "failed",
          errorMessage: (error as Error).message,
          completedAt: new Date()
        })
      }
      
      throw error
    }
  }

  /**
   * Execute email action node
   */
  private async executeEmailAction(node: WorkflowNode): Promise<void> {
    try {
      const { subject, content } = node.config
      
      // In a real implementation, this would send an actual email
      // For now, we'll just log the action
      console.log(`Sending email to ${this.contact.email}: ${subject}`)
      
      // Note: In a real implementation, we would integrate with an email service
    } catch (error) {
      console.error("Error sending email:", error)
      throw error
    }
  }

  /**
   * Execute SMS action node
   */
  private async executeSMSAction(node: WorkflowNode): Promise<void> {
    try {
      const { message } = node.config
      
      // In a real implementation, this would send an actual SMS
      // For now, we'll just log the action
      console.log(`Sending SMS to ${this.contact.phone}: ${message}`)
    } catch (error) {
      console.error("Error sending SMS:", error)
      throw error
    }
  }

  /**
   * Execute tag action node
   */
  private async executeTagAction(node: WorkflowNode): Promise<void> {
    try {
      const { tag } = node.config
      
      // In a real implementation, we would add the tag to the contact
      console.log(`Added tag "${tag}" to contact ${this.contact.id}`)
    } catch (error) {
      console.error("Error adding tag:", error)
      throw error
    }
  }

  /**
   * Proceed to the next nodes based on connections
   */
  private async proceedToNextNodes(currentNodeId: string): Promise<void> {
    // Find all connections from the current node
    const connections = this.workflow.connections.filter(
      conn => conn.sourceNodeId === currentNodeId
    )

    if (connections.length === 0) {
      // Workflow completed for this contact
      await this.updateWorkflowMetrics("completed")
      
      // Update execution status to completed
      if (this.executionId) {
        await WorkflowExecutionDBService.updateExecution(this.executionId, {
          status: "completed",
          completedAt: new Date()
        })
      }
      
      return
    }

    // Execute all connected nodes
    for (const connection of connections) {
      const nextNode = this.workflow.nodes.find(
        node => node.id === connection.targetNodeId
      )

      if (nextNode) {
        // Handle delay nodes differently
        if (nextNode.subType === "delay") {
          // Schedule delayed execution
          await this.scheduleDelayedExecution(nextNode, connection)
        } else {
          // Execute immediately
          await this.executeNode(nextNode)
        }
      }
    }
  }

  /**
   * Schedule delayed execution for delay nodes
   */
  private async scheduleDelayedExecution(node: WorkflowNode, connection: WorkflowConnection): Promise<void> {
    try {
      const { duration, unit } = node.config
      let delayMs = 0

      // Convert duration to milliseconds
      switch (unit) {
        case "minutes":
          delayMs = duration * 60 * 1000
          break
        case "hours":
          delayMs = duration * 60 * 60 * 1000
          break
        case "days":
          delayMs = duration * 24 * 60 * 60 * 1000
          break
        case "weeks":
          delayMs = duration * 7 * 24 * 60 * 60 * 1000
          break
      }

      // In a real implementation, we would schedule this using a job queue
      // For now, we'll just log the scheduled delay
      console.log(`Scheduled delay of ${duration} ${unit} for contact ${this.contact.id} in workflow ${this.workflow.id}`)

      // Create a scheduled execution record
      await WorkflowExecutionDBService.createExecution({
        workflowId: this.workflow.id,
        contactId: this.contact.id,
        nodeId: node.id,
        status: "scheduled",
        startedAt: new Date(), // This field is required
        scheduledAt: new Date(Date.now() + delayMs),
        organizationId: this.workflow.organizationId
      })
    } catch (error) {
      console.error("Error scheduling delayed execution:", error)
      throw error
    }
  }

  /**
   * Update workflow metrics
   */
  private async updateWorkflowMetrics(metric: keyof Workflow["metrics"]): Promise<void> {
    try {
      // Get the current workflow
      const workflow = await db.findById<Workflow>("workflows", this.workflow.id)
      
      if (workflow) {
        // Update the metrics
        const updatedMetrics = {
          ...workflow.metrics,
          [metric]: (workflow.metrics[metric] || 0) + 1
        }
        
        // Update the workflow with new metrics
        await db.updateById("workflows", this.workflow.id, { 
          metrics: updatedMetrics,
          updatedAt: new Date()
        } as Partial<Workflow>)
        
        console.log(`Updated workflow ${this.workflow.id} metrics: ${metric} +1`)
      }
    } catch (error) {
      console.error("Error updating workflow metrics:", error)
    }
  }
}

/**
 * Process scheduled delayed executions
 */
export async function processScheduledExecutions(): Promise<void> {
  try {
    // Find all scheduled executions that are due
    const dueExecutions = await WorkflowExecutionDBService.findDueScheduledExecutions()

    // Process each due execution
    for (const execution of dueExecutions) {
      try {
        // Get workflow and contact
        const workflow = await db.findById<Workflow>("workflows", execution.workflowId)
        
        const contact = await db.findById<Contact>("contacts", execution.contactId)
        
        if (workflow && contact) {
          // Get the node to execute
          const node = workflow.nodes.find(n => n.id === execution.nodeId)
          
          if (node) {
            // Create execution service and execute the node
            const executionService = new WorkflowExecutionService(workflow, contact)
            
            // Execute the delayed node
            await executionService["executeNode"](node)
            
            // Mark execution as completed
            await WorkflowExecutionDBService.updateExecution(execution.id, {
              status: "completed",
              completedAt: new Date()
            })
          }
        }
      } catch (executionError) {
        console.error(`Error processing scheduled execution ${execution.id}:`, executionError)
        // Mark execution as failed
        try {
          await WorkflowExecutionDBService.updateExecution(execution.id, {
            status: "failed",
            errorMessage: (executionError as Error).message,
            completedAt: new Date()
          })
        } catch (updateError) {
          console.error(`Error updating failed execution ${execution.id}:`, updateError)
        }
      }
    }
  } catch (error) {
    console.error("Error processing scheduled executions:", error)
  }
}