/** Admin/UI workflow labels only — never imply AI or clinician auto-decision. */
export const WORKFLOW_STATUSES = [
  "draft",
  "submitted",
  "awaiting_review",
  "more_information_required",
  "under_clinician_review",
  "review_completed",
  "not_eligible",
  "eligible_for_next_admin_step",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export const WORKFLOW_LABELS: Record<WorkflowStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  awaiting_review: "Awaiting review",
  more_information_required: "More information required",
  under_clinician_review: "Under clinician review",
  review_completed: "Review completed",
  not_eligible: "Not eligible",
  eligible_for_next_admin_step: "Eligible for next administrative step",
};

const LEGACY_STATUS: Record<string, WorkflowStatus> = {
  new: "submitted",
  reviewed: "review_completed",
  closed: "review_completed",
};

export function normalizeWorkflowStatus(raw: unknown): WorkflowStatus {
  if (typeof raw === "string" && (WORKFLOW_STATUSES as readonly string[]).includes(raw)) {
    return raw as WorkflowStatus;
  }
  if (typeof raw === "string" && LEGACY_STATUS[raw]) {
    return LEGACY_STATUS[raw];
  }
  return "submitted";
}

export function workflowLabel(status: WorkflowStatus): string {
  return WORKFLOW_LABELS[status];
}
