// Workflow Models

export interface WorkflowExecution {
  id: string
  workflowId: string
  contactId: string
  nodeId: string
  status: WorkflowExecutionStatus
  startedAt: Date
  completedAt?: Date
  scheduledAt?: Date
  errorMessage?: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export type WorkflowExecutionStatus = 
  | 'pending' 
  | 'scheduled' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'

export interface WorkflowExecutionStep {
  id: string
  executionId: string
  nodeId: string
  status: WorkflowExecutionStatus
  startedAt: Date
  completedAt?: Date
  inputData?: Record<string, any>
  outputData?: Record<string, any>
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}

// Extend the existing Workflow type with execution methods
export interface ExecutableWorkflow {
  // In a real implementation, we would extend the Workflow type
  // with execution-specific methods and properties
  execute(contactId: string): Promise<WorkflowExecution>
}