"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SOCApprovalQuestionsProps {
  onChange: (answers: SOCApprovalAnswers) => void
}

export interface SOCApprovalAnswers {
  question1Answer: string
  question2Checked: boolean
  question3Checked: boolean
}

export function SOCApprovalQuestions({ onChange }: SOCApprovalQuestionsProps) {
  const [answers, setAnswers] = useState<SOCApprovalAnswers>({
    question1Answer: "",
    question2Checked: false,
    question3Checked: false,
  })

  const handleChange = (field: keyof SOCApprovalAnswers, value: string | boolean) => {
    const newAnswers = { ...answers, [field]: value }
    setAnswers(newAnswers)
    onChange(newAnswers)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SOC 승인 필요</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="font-medium">SOC 기업이 표시되어 있어 승인이 필요합니다. 아래 정보를 추가로 입력해주세요.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question1">
              Q.1. 본 제공 사항이 상기 언급된 목적에만 관련된 것인지 확인해 주시기 바랍니다. 다른 종류의 잠재적 제공권
              경우, 구체적으로 기재해 주십시오.
            </Label>
            <Textarea
              id="question1"
              placeholder="답변을 입력하세요"
              value={answers.question1Answer}
              onChange={(e) => handleChange("question1Answer", e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="question2"
              checked={answers.question2Checked}
              onCheckedChange={(checked) => handleChange("question2Checked", checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="question2" className="text-sm font-normal">
                Q.2. 본 제공 사항이 수령인의 판단에 영향을 줄 수 있는 민감한 시기에 제공되지 않음을 확인해 주시기
                바랍니다.
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="question3"
              checked={answers.question3Checked}
              onCheckedChange={(checked) => handleChange("question3Checked", checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="question3" className="text-sm font-normal">
                Q.3. 또한, 본 제공 사항(성격 및 금액)이 수령인의 회사 정책 및 현지 법률에 위배되지 않음을 확인해 주시기
                바랍니다.
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
