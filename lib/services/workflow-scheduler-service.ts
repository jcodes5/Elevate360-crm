/**
 * Workflow Scheduler Service
 * 
 * This service handles the scheduling and execution of time-based workflow tasks.
 * In a production environment, this would be implemented with a proper job queue
 * system like BullMQ, Agenda, or a cloud-based solution like AWS Lambda + EventBridge.
 */

import { WorkflowTriggerService } from "@/lib/services/workflow-trigger-service"

export class WorkflowSchedulerService {
  private intervalIds: NodeJS.Timeout[] = []
  
  /**
   * Start all scheduled jobs
   */
  start(): void {
    // Process scheduled workflow executions every minute
    const executionInterval = setInterval(() => {
      this.processScheduledExecutions()
    }, 60 * 1000) // Every minute
    
    this.intervalIds.push(executionInterval)
    
    // Check date-based triggers every hour
    const dateTriggerInterval = setInterval(() => {
      this.checkDateBasedTriggers()
    }, 60 * 60 * 1000) // Every hour
    
    this.intervalIds.push(dateTriggerInterval)
    
    console.log("Workflow scheduler started")
  }
  
  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    this.intervalIds.forEach(intervalId => clearInterval(intervalId))
    this.intervalIds = []
    console.log("Workflow scheduler stopped")
  }
  
  /**
   * Process scheduled workflow executions
   */
  private async processScheduledExecutions(): Promise<void> {
    try {
      const response = await fetch("/api/workflows/execution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log("Scheduled workflow executions processed:", result)
    } catch (error) {
      console.error("Error processing scheduled workflow executions:", error)
    }
  }
  
  /**
   * Check date-based triggers
   */
  private async checkDateBasedTriggers(): Promise<void> {
    try {
      // Handle date-based triggers
      await WorkflowTriggerService.handleDateBasedTriggers()
      console.log("Date-based triggers checked")
    } catch (error) {
      console.error("Error checking date-based triggers:", error)
    }
  }
}

// Export a singleton instance
export const workflowSchedulerService = new WorkflowSchedulerService()