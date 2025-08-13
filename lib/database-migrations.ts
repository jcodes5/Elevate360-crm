/**
 * Database Migration Script for Workflow Execution
 * 
 * This script defines the database schema for workflow execution tracking.
 * In a production environment with Prisma, this would be handled through Prisma schema files.
 */

export const WORKFLOW_EXECUTION_SCHEMA = `
  CREATE TABLE IF NOT EXISTS workflow_executions (
    id VARCHAR(36) PRIMARY KEY,
    workflow_id VARCHAR(36) NOT NULL,
    contact_id VARCHAR(36) NOT NULL,
    node_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'scheduled', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    scheduled_at TIMESTAMP NULL,
    error_message TEXT,
    organization_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_contact_id (contact_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at)
  );
`

export const WORKFLOW_EXECUTION_STEPS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS workflow_execution_steps (
    id VARCHAR(36) PRIMARY KEY,
    execution_id VARCHAR(36) NOT NULL,
    node_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'scheduled', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    input_data JSON,
    output_data JSON,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE,
    INDEX idx_execution_id (execution_id),
    INDEX idx_node_id (node_id),
    INDEX idx_status (status)
  );
`

// In a real implementation with Prisma, we would define these models in the schema.prisma file:
/*
model WorkflowExecution {
  id              String      @id @default(uuid())
  workflowId      String
  contactId       String
  nodeId          String
  status          WorkflowExecutionStatus @default(PENDING)
  startedAt       DateTime?   @map("started_at")
  completedAt     DateTime?   @map("completed_at")
  scheduledAt     DateTime?   @map("scheduled_at")
  errorMessage    String?     @db.Text @map("error_message")
  organizationId  String      @map("organization_id")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @default(now()) @updatedAt @map("updated_at")
  
  workflow        Workflow    @relation(fields: [workflowId], references: [id])
  contact         Contact     @relation(fields: [contactId], references: [id])
  
  steps           WorkflowExecutionStep[]
  
  @@index([workflowId])
  @@index([contactId])
  @@index([status])
  @@index([scheduledAt])
  @@map("workflow_executions")
}

model WorkflowExecutionStep {
  id           String    @id @default(uuid())
  executionId  String
  nodeId       String    @map("node_id")
  status       WorkflowExecutionStatus @default(PENDING)
  startedAt    DateTime? @map("started_at")
  completedAt  DateTime? @map("completed_at")
  inputData    Json?     @map("input_data")
  outputData   Json?     @map("output_data")
  errorMessage String?   @db.Text @map("error_message")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @default(now()) @updatedAt @map("updated_at")
  
  execution    WorkflowExecution @relation(fields: [executionId], references: [id])
  
  @@index([executionId])
  @@index([nodeId])
  @@index([status])
  @@map("workflow_execution_steps")
}

enum WorkflowExecutionStatus {
  PENDING
  SCHEDULED
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}
*/