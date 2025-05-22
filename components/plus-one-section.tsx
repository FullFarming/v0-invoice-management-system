"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"

interface Beneficiary {
  id: string
  name: string
  email: string
  percentage: number
}

interface PlusOneSectionProps {
  onPlusOneDataChange: (data: PlusOneData | null) => void
}

export interface PlusOneData {
  isEnabled: boolean
  amount: number
  isCompetitive: boolean
  beneficiaries: Beneficiary[]
  description: string
}

export function PlusOneSection({ onPlusOneDataChange }: PlusOneSectionProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [amount, setAmount] = useState("")
  const [isCompetitive, setIsCompetitive] = useState(false)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([{ id: "1", name: "", email: "", percentage: 100 }])
  const [description, setDescription] = useState("")

  const handlePlusOneToggle = (checked: boolean) => {
    setIsEnabled(checked)
    if (!checked) {
      onPlusOneDataChange(null)
    } else {
      updatePlusOneData()
    }
  }

  const updatePlusOneData = () => {
    if (!isEnabled) return

    onPlusOneDataChange({
      isEnabled,
      amount: Number.parseFloat(amount) || 0,
      isCompetitive,
      beneficiaries,
      description,
    })
  }

  const addBeneficiary = () => {
    const newBeneficiaries = [...beneficiaries, { id: Date.now().toString(), name: "", email: "", percentage: 0 }]
    setBeneficiaries(newBeneficiaries)
    updatePlusOneData()
  }

  const removeBeneficiary = (id: string) => {
    if (beneficiaries.length <= 1) return
    const newBeneficiaries = beneficiaries.filter((b) => b.id !== id)
    setBeneficiaries(newBeneficiaries)
    updatePlusOneData()
  }

  const updateBeneficiary = (id: string, field: keyof Beneficiary, value: string | number) => {
    const newBeneficiaries = beneficiaries.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    setBeneficiaries(newBeneficiaries)
    updatePlusOneData()
  }

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0)
  const isPercentageValid = totalPercentage === 100

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox id="plusOneEnabled" checked={isEnabled} onCheckedChange={handlePlusOneToggle} />
        <Label htmlFor="plusOneEnabled" className="font-medium">
          Plus One Included
        </Label>
      </div>

      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Plus One 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>보상금 (정책 기준)</Label>
              <div className="mt-1.5">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₩</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      updatePlusOneData()
                    }}
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">1천만원 미만: 지급 제외</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCompetitive"
                checked={isCompetitive}
                onCheckedChange={(checked) => {
                  setIsCompetitive(!!checked)
                  updatePlusOneData()
                }}
              />
              <Label htmlFor="isCompetitive">경쟁 수주입니다</Label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">수혜자 정보</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBeneficiary}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> 수혜자 추가
                </Button>
              </div>

              {beneficiaries.map((beneficiary, index) => (
                <div key={beneficiary.id} className="mb-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">수혜자 {index + 1}</h4>
                    {beneficiaries.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeBeneficiary(beneficiary.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`name-${beneficiary.id}`} className="mb-1.5 block">
                        수혜자 이름 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`name-${beneficiary.id}`}
                        value={beneficiary.name}
                        onChange={(e) => updateBeneficiary(beneficiary.id, "name", e.target.value)}
                        placeholder="수혜자 이름을 입력하세요"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`email-${beneficiary.id}`} className="mb-1.5 block">
                        수혜자 이메일 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`email-${beneficiary.id}`}
                        type="email"
                        value={beneficiary.email}
                        onChange={(e) => updateBeneficiary(beneficiary.id, "email", e.target.value)}
                        placeholder="수혜자 이메일을 입력하세요"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`percentage-${beneficiary.id}`} className="mb-1.5 block">
                        지분 비율 (%) <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id={`percentage-${beneficiary.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={beneficiary.percentage}
                          onChange={(e) =>
                            updateBeneficiary(beneficiary.id, "percentage", Number.parseFloat(e.target.value) || 0)
                          }
                          className="mr-2"
                        />
                        <span>%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm">
                      보상금: ₩{((Number.parseFloat(amount) || 0) * (beneficiary.percentage / 100)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-end mt-2">
                <p className={`font-medium ${isPercentageValid ? "text-green-600" : "text-red-600"}`}>
                  지분 비율 합계: {totalPercentage}%
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="plusOneDescription" className="mb-1.5 block">
                추가 설명
              </Label>
              <Textarea
                id="plusOneDescription"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  updatePlusOneData()
                }}
                placeholder="Plus One에 대한 추가 설명이나 특이사항을 입력하세요"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
