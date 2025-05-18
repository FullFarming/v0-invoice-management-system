"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

export type ApprovalStatus = "pending" | "approved" | "rejected"

export interface ApprovalStep {
  id: string
  email: string
  status: ApprovalStatus
  comment?: string
  timestamp?: string
}

interface ApprovalStatusProps {
  steps: ApprovalStep[]
  currentStep: number
}

export function ApprovalStatus({ steps, currentStep }: ApprovalStatusProps) {
  const totalSteps = steps.length
  const completedSteps = steps.filter((step) => step.status === "approved").length
  const rejectedSteps = steps.filter((step) => step.status === "rejected").length

  // 진행률 계산 (거부된 경우는 진행 중단)
  const progress = rejectedSteps > 0 ? (completedSteps / totalSteps) * 100 : ((currentStep - 1) / totalSteps) * 100

  // 전체 상태 결정
  let overallStatus: ApprovalStatus = "pending"
  if (rejectedSteps > 0) {
    overallStatus = "rejected"
  } else if (completedSteps === totalSteps) {
    overallStatus = "approved"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">승인 진행 상황</div>
        <Badge
          variant={
            overallStatus === "approved" ? "default" : overallStatus === "rejected" ? "destructive" : "secondary"
          }
          className="px-2 py-1"
        >
          {overallStatus === "approved" && <CheckCircle2 className="mr-1 h-3 w-3" />}
          {overallStatus === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
          {overallStatus === "pending" && <Clock className="mr-1 h-3 w-3" />}
          {overallStatus === "approved" ? "승인 완료" : overallStatus === "rejected" ? "승인 거부" : "승인 대기 중"}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center justify-between p-2 rounded-md ${
              index + 1 === currentStep && step.status === "pending" ? "bg-blue-50 border border-blue-200" : "border"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
                  step.status === "approved"
                    ? "bg-green-100 text-green-600"
                    : step.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : index + 1 < currentStep
                        ? "bg-gray-100 text-gray-600"
                        : index + 1 === currentStep
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                }`}
              >
                {index + 1}
              </div>
              <div>
                <div className="font-medium">{step.email}</div>
                {step.comment && step.status === "rejected" && (
                  <div className="text-sm text-red-600 mt-1">코멘트: {step.comment}</div>
                )}
              </div>
            </div>
            <Badge
              variant={step.status === "approved" ? "success" : step.status === "rejected" ? "destructive" : "outline"}
            >
              {step.status === "approved"
                ? "승인됨"
                : step.status === "rejected"
                  ? "거부됨"
                  : index + 1 === currentStep
                    ? "현재 단계"
                    : "대기 중"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
