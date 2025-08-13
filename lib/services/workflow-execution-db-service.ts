import { db } from "@/lib/database"
import { prisma, PrismaDatabase } from "@/lib/database-prisma"
import { WorkflowExecution, WorkflowExecutionStep } from "@/lib/models"

/**
 * Database service for workflow execution operations
 * This service handles all database interactions for workflow executions
 */
export class WorkflowExecutionDBService {
  private static db: PrismaDatabase = new PrismaDatabase()
  
  /**
   * Create a new workflow execution record
   */
  static async createExecution(execution: Omit<WorkflowExecution, "id" | "createdAt" | "updatedAt">): Promise<WorkflowExecution> {
    return await this.db.create<WorkflowExecution>("workflowExecutions", {
      ...execution,
      startedAt: execution.startedAt || new Date(),
    })
  }
  
  /**
   * Update a workflow execution record
   */
  static async updateExecution(id: string, data: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
    const result = await this.db.updateById<WorkflowExecution>("workflowExecutions", id, data)
    if (!result) {
      throw new Error(`Failed to update workflow execution with id ${id}`)
    }
    return result
  }
  
  /**
   * Find workflow executions by workflow ID
   */
  static async findExecutionsByWorkflowId(workflowId: string): Promise<WorkflowExecution[]> {
    return await this.db.findMany<WorkflowExecution>("workflowExecutions", {
      where: { workflowId }
    })
  }
  
  /**
   * Find scheduled workflow executions that are due
   */
  static async findDueScheduledExecutions(): Promise<WorkflowExecution[]> {
    const now = new Date()
    
    return await this.db.findMany<WorkflowExecution>("workflowExecutions", {
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now
        }
      }
    })
  }
  
  /**
   * Create a new workflow execution step
   */
  static async createExecutionStep(step: Omit<WorkflowExecutionStep, "id" | "createdAt" | "updatedAt">): Promise<WorkflowExecutionStep> {
    return await this.db.create<WorkflowExecutionStep>("workflowExecutionSteps", {
      ...step,
      startedAt: step.startedAt || new Date(),
    })
  }
  
  /**
   * Update a workflow execution step
   */
  static async updateExecutionStep(id: string, data: Partial<WorkflowExecutionStep>): Promise<WorkflowExecutionStep> {
    const result = await this.db.updateById<WorkflowExecutionStep>("workflowExecutionSteps", id, data)
    if (!result) {
      throw new Error(`Failed to update workflow execution step with id ${id}`)
    }
    return result
  }
  
  /**
   * Find execution steps by execution ID
   */
  static async findStepsByExecutionId(executionId: string): Promise<WorkflowExecutionStep[]> {
    return await this.db.findMany<WorkflowExecutionStep>("workflowExecutionSteps", {
      where: { executionId }
    })
  }
}