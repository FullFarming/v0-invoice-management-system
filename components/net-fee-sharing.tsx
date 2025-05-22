"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MemberRow {
  id: string
  email: string
  amount: string
  percentage: string
  team: string
}

interface NetFeeSharingProps {
  totalAmount: number
  currency: string
  onComplete?: (isComplete: boolean) => void
}

export function NetFeeSharing({ totalAmount, currency, onComplete }: NetFeeSharingProps) {
  const [members, setMembers] = useState<MemberRow[]>([{ id: "1", email: "", amount: "0", percentage: "0", team: "" }])

  const addMember = () => {
    const newMember: MemberRow = {
      id: Date.now().toString(),
      email: "",
      amount: "0",
      percentage: "0",
      team: "",
    }
    setMembers([...members, newMember])
  }

  const updateMember = (id: string, field: keyof MemberRow, value: string) => {
    setMembers(members.map((member) => (member.id === id ? { ...member, [field]: value } : member)))
  }

  const calculateTotalPercentage = () => {
    return members.reduce((total, member) => total + Number.parseFloat(member.percentage || "0"), 0)
  }

  const calculateTotalAmount = () => {
    return members.reduce((total, member) => total + Number.parseFloat(member.amount || "0"), 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency }).format(amount)
  }

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Net Fee Sharing *</h3>
        <Button variant="outline" className="bg-indigo-900 text-white hover:bg-indigo-800" onClick={addMember}>
          + 맴버 추가
        </Button>
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <div>총 수수료: {currency}0</div>
        <div>순 수수료: {currency}0</div>
      </div>

      {members.map((member) => (
        <div key={member.id} className="grid grid-cols-4 gap-3 mt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">이메일 *</label>
            <Input
              placeholder="이메일 주소"
              value={member.email}
              onChange={(e) => updateMember(member.id, "email", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">금액 (KRW) *</label>
            <Input
              type="number"
              value={member.amount}
              onChange={(e) => updateMember(member.id, "amount", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">비율 (%) *</label>
            <Input
              type="number"
              value={member.percentage}
              onChange={(e) => updateMember(member.id, "percentage", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">팀 *</label>
            <Select value={member.team} onValueChange={(value) => updateMember(member.id, "team", value)}>
              <SelectTrigger>
                <SelectValue placeholder="팀 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team1">팀 1</SelectItem>
                <SelectItem value="team2">팀 2</SelectItem>
                <SelectItem value="team3">팀 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}

      <div className="flex justify-between text-sm mt-2">
        <div>총 비율: {calculateTotalPercentage().toFixed(2)}% (100.00% 부족)</div>
        <div>
          총 금액: {currency}
          {calculateTotalAmount()}
        </div>
      </div>
    </div>
  )
}
