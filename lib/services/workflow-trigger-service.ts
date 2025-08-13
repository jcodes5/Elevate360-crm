import { Workflow, Contact, TriggerType } from "@/types"
import { db } from "@/lib/database"
import { WorkflowExecutionService } from "@/lib/services/workflow-execution-service"

export class WorkflowTriggerService {
  /**
   * Handle contact created trigger
   */
  static async handleContactCreated(contact: Contact): Promise<void> {
    try {
      // Find all active workflows with contact_created trigger
      const workflows = await this.findWorkflowsByTrigger("contact_created")
      
      // Start execution for each workflow
      for (const workflow of workflows) {
        await this.startWorkflowExecution(workflow, contact)
      }
    } catch (error) {
      console.error("Error handling contact created trigger:", error)
    }
  }

  /**
   * Handle tag added trigger
   */
  static async handleTagAdded(contact: Contact, tag: string): Promise<void> {
    try {
      // Find all active workflows with tag_added trigger
      const workflows = await this.findWorkflowsByTrigger("tag_added")
      
      // Filter workflows that match the specific tag condition
      const matchingWorkflows = workflows.filter(workflow => {
        const trigger = workflow.trigger
        if (trigger.type !== "tag_added") return false
        
        // Check if the tag matches the trigger condition
        // In a real implementation, this would be more sophisticated
        return !trigger.conditions?.tag || trigger.conditions.tag === tag
      })
      
      // Start execution for each matching workflow
      for (const workflow of matchingWorkflows) {
        await this.startWorkflowExecution(workflow, contact)
      }
    } catch (error) {
      console.error("Error handling tag added trigger:", error)
    }
  }

  /**
   * Handle form submitted trigger
   */
  static async handleFormSubmitted(contact: Contact, formId: string): Promise<void> {
    try {
      // Find all active workflows with form_submitted trigger
      const workflows = await this.findWorkflowsByTrigger("form_submitted")
      
      // Filter workflows that match the specific form condition
      const matchingWorkflows = workflows.filter(workflow => {
        const trigger = workflow.trigger
        if (trigger.type !== "form_submitted") return false
        
        // Check if the form ID matches the trigger condition
        return !trigger.conditions?.formId || trigger.conditions.formId === formId
      })
      
      // Start execution for each matching workflow
      for (const workflow of matchingWorkflows) {
        await this.startWorkflowExecution(workflow, contact)
      }
    } catch (error) {
      console.error("Error handling form submitted trigger:", error)
    }
  }

  /**
   * Handle date based trigger
   */
  static async handleDateBasedTriggers(): Promise<void> {
    try {
      // Find all active workflows with date_based trigger
      const workflows = await this.findWorkflowsByTrigger("date_based")
      
      const now = new Date()
      
      // For each workflow, check if conditions are met
      for (const workflow of workflows) {
        const trigger = workflow.trigger
        if (trigger.type !== "date_based") continue
        
        // Get contacts that match the date condition
        let matchingContacts: Contact[] = []
        
        // Example conditions - in a real implementation, this would be more robust
        if (trigger.conditions?.type === "birthday") {
          // Find contacts with birthdays today
          const allContacts = await db.findMany<Contact>("contacts", {})
          matchingContacts = allContacts.filter(contact => {
            if (!contact.createdAt) return false
            const birthday = new Date(contact.createdAt)
            return birthday.getDate() === now.getDate() && 
                   birthday.getMonth() === now.getMonth()
          })
        } else if (trigger.conditions?.type === "anniversary") {
          // Find contacts with anniversaries today
          const allContacts = await db.findMany<Contact>("contacts", {})
          matchingContacts = allContacts.filter(contact => {
            if (!contact.createdAt) return false
            const createdAt = new Date(contact.createdAt)
            return createdAt.getDate() === now.getDate() && 
                   createdAt.getMonth() === now.getMonth()
          })
        }
        
        // Start execution for each matching contact
        for (const contact of matchingContacts) {
          await this.startWorkflowExecution(workflow, contact)
        }
      }
    } catch (error) {
      console.error("Error handling date based triggers:", error)
    }
  }

  /**
   * Handle deal stage changed trigger
   */
  static async handleDealStageChanged(contactId: string, previousStage: string, newStage: string): Promise<void> {
    try {
      // Find all active workflows with deal_stage_changed trigger
      const workflows = await this.findWorkflowsByTrigger("deal_stage_changed")
      
      // Get the contact
      const contact = await db.findById<Contact>("contacts", contactId)
      if (!contact) return
      
      // Filter workflows that match the stage change condition
      const matchingWorkflows = workflows.filter(workflow => {
        const trigger = workflow.trigger
        if (trigger.type !== "deal_stage_changed") return false
        
        // Check if the stage change matches the trigger conditions
        const conditions = trigger.conditions || {}
        const fromStage = conditions.fromStage
        const toStage = conditions.toStage
        
        return (!fromStage || fromStage === previousStage) && 
               (!toStage || toStage === newStage)
      })
      
      // Start execution for each matching workflow
      for (const workflow of matchingWorkflows) {
        await this.startWorkflowExecution(workflow, contact)
      }
    } catch (error) {
      console.error("Error handling deal stage changed trigger:", error)
    }
  }

  /**
   * Find workflows by trigger type
   */
  private static async findWorkflowsByTrigger(triggerType: TriggerType): Promise<Workflow[]> {
    // Find all active workflows and filter in memory
    // Note: Complex nested queries are not supported by the database service
    // so we need to filter in memory
    const allWorkflows = await db.findMany<Workflow>("workflows", {})
    
    return allWorkflows.filter(workflow => 
      workflow.status === "active" && 
      workflow.trigger.type === triggerType
    )
  }

  /**
   * Start workflow execution
   */
  private static async startWorkflowExecution(workflow: Workflow, contact: Contact): Promise<void> {
    try {
      const executionService = new WorkflowExecutionService(workflow, contact)
      await executionService.start()
    } catch (error) {
      console.error(`Error starting workflow ${workflow.id} for contact ${contact.id}:`, error)
    }
  }
}