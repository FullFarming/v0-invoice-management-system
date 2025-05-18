"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ApprovalActionsProps {
  onApprove: () => void
  onReject: (comment: string) => void
}

export function ApprovalActions({ onApprove, onReject }: ApprovalActionsProps) {
  const [rejectComment, setRejectComment] = useState("")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const handleReject = () => {
    onReject(rejectComment)
    setRejectComment("")
    setRejectDialogOpen(false)
  }

  return (
    <div className="flex space-x-4">
      <Button onClick={onApprove} className="flex-1 bg-green-600 hover:bg-green-700">
        <CheckCircle className="mr-2 h-4 w-4" />
        승인
      </Button>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="flex-1">
            <XCircle className="mr-2 h-4 w-4" />
            거부
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>승인 거부</DialogTitle>
            <DialogDescription>승인을 거부하는 이유를 입력해주세요. 이 내용은 신청자에게 전달됩니다.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="reject-comment">거부 사유</Label>
            <Textarea
              id="reject-comment"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="거부 사유를 입력하세요"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectComment.trim()}>
              거부 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
