"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { VisualFlowBuilder } from "@/components/workflow/visual-flow-builder"

export default function FlowBuilderPage() {
  return (
    <ProtectedRoute requiredResource="workflows" requiredAction="create">
      <VisualFlowBuilder />
    </ProtectedRoute>
  )
}
