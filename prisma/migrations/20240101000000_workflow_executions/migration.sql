-- CreateTable
CREATE TABLE `workflow_executions` (
    `id` VARCHAR(191) NOT NULL,
    `workflow_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,
    `node_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `scheduled_at` DATETIME(3) NULL,
    `error_message` TEXT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `workflow_executions_workflow_id_idx`(`workflow_id`),
    INDEX `workflow_executions_contact_id_idx`(`contact_id`),
    INDEX `workflow_executions_status_idx`(`status`),
    INDEX `workflow_executions_scheduled_at_idx`(`scheduled_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_execution_steps` (
    `id` VARCHAR(191) NOT NULL,
    `execution_id` VARCHAR(191) NOT NULL,
    `node_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `input_data` JSON NULL,
    `output_data` JSON NULL,
    `error_message` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `workflow_execution_steps_execution_id_idx`(`execution_id`),
    INDEX `workflow_execution_steps_node_id_idx`(`node_id`),
    INDEX `workflow_execution_steps_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workflow_executions` ADD CONSTRAINT `workflow_executions_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_executions` ADD CONSTRAINT `workflow_executions_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_executions` ADD CONSTRAINT `workflow_executions_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_executions` ADD CONSTRAINT `workflow_executions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_execution_steps` ADD CONSTRAINT `workflow_execution_steps_execution_id_fkey` FOREIGN KEY (`execution_id`) REFERENCES `workflow_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;