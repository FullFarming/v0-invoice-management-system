"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash } from "lucide-react"
import { formatCurrency, getSecondaryCurrencyDisplay } from "@/lib/currency"

interface FeeSharingProps {
  totalAmount: number
  hasThirdPartyVendor: boolean
  thirdPartyAmount?: number
  onComplete?: (isComplete: boolean) => void
  currency?: string
}

interface FeeShare {
  id: string
  email: string
  amount: number
  percentage: number
  team: string
}

// 예시 팀 목록을 사내 부서 목록으로 변경
const teams = [
  { id: "tag", name: "TAG (Tenant Advisory Group)" },
  { id: "gos", name: "Global Occupier Services" },
  { id: "olma", name: "Office Leasing Marketing Advisory" },
  { id: "pds", name: "Project & Development Services" },
  { id: "retail-strategy", name: "Retail Strategy" },
  { id: "rcg", name: "Retail Consulting Group" },
  { id: "rls", name: "Retail Leasing Services" },
  { id: "rvat", name: "Retail Value Add Transaction" },
  { id: "retail-logistics", name: "Retail Logistics" },
  { id: "asset-service", name: "Asset Service" },
  { id: "capital-markets", name: "Capital Markets" },
  { id: "bds", name: "Business Development Services" },
  { id: "finance", name: "Finance" },
  { id: "hr", name: "HR" },
  { id: "wpr", name: "WPR" },
]

export function FeeSharing({
  totalAmount,
  hasThirdPartyVendor,
  thirdPartyAmount = 0,
  onComplete,
  currency = "KRW",
}: FeeSharingProps) {
  const [feeShares, setFeeShares] = useState<FeeShare[]>([
    {
      id: "1",
      email: "",
      amount: 0,
      percentage: 0,
      team: "",
    },
  ])

  const [netAmount, setNetAmount] = useState(totalAmount)
  const [totalPercentage, setTotalPercentage] = useState(0)
  const [totalShareAmount, setTotalShareAmount] = useState(0)

  // 3rd party 금액이 변경되면 순 금액 자동 계산
  useEffect(() => {
    if (hasThirdPartyVendor) {
      const newNetAmount = totalAmount - thirdPartyAmount
      setNetAmount(newNetAmount > 0 ? newNetAmount : 0)

      // 순 금액이 변경되면 각 행의 금액도 비율에 맞게 자동 조정
      setFeeShares(
        feeShares.map((share) => {
          const newAmount = (share.percentage / 100) * (newNetAmount > 0 ? newNetAmount : 0)
          return { ...share, amount: Math.round(newAmount) }
        }),
      )
    } else {
      setNetAmount(totalAmount)
    }
  }, [totalAmount, thirdPartyAmount, hasThirdPartyVendor])

  // 금액 또는 비율이 변경되면 총계 계산
  useEffect(() => {
    let totalPct = 0
    let totalAmt = 0

    feeShares.forEach((share) => {
      totalPct += share.percentage
      totalAmt += share.amount
    })

    setTotalPercentage(totalPct)
    setTotalShareAmount(totalAmt)

    // Fee Sharing 완료 상태 업데이트
    // 완료 조건: 최소 하나의 행이 있고, 모든 행에 이메일과 팀이 입력되어 있으며, 총 비율이 100%인 경우
    const isComplete =
      feeShares.length > 0 && feeShares.every((share) => share.email && share.team) && Math.abs(totalPct - 100) < 0.01

    if (onComplete) {
      onComplete(isComplete)
    }
  }, [feeShares, onComplete])

  // 금액 입력 시 비율 자동 계산
  const handleAmountChange = (id: string, amount: number) => {
    setFeeShares(
      feeShares.map((share) => {
        if (share.id === id) {
          const percentage = netAmount > 0 ? (amount / netAmount) * 100 : 0
          return { ...share, amount, percentage: Number.parseFloat(percentage.toFixed(2)) }
        }
        return share
      }),
    )
  }

  // 비율 입력 시 금액 자동 계산
  const handlePercentageChange = (id: string, percentage: number) => {
    setFeeShares(
      feeShares.map((share) => {
        if (share.id === id) {
          const amount = (percentage / 100) * netAmount
          return { ...share, percentage, amount: Math.round(amount) }
        }
        return share
      }),
    )
  }

  // 이메일 변경
  const handleEmailChange = (id: string, email: string) => {
    setFeeShares(
      feeShares.map((share) => {
        if (share.id === id) {
          return { ...share, email }
        }
        return share
      }),
    )
  }

  // 팀 변경
  const handleTeamChange = (id: string, team: string) => {
    setFeeShares(
      feeShares.map((share) => {
        if (share.id === id) {
          return { ...share, team }
        }
        return share
      }),
    )
  }

  // 행 추가
  const addRow = () => {
    if (feeShares.length < 10) {
      setFeeShares([
        ...feeShares,
        {
          id: Date.now().toString(),
          email: "",
          amount: 0,
          percentage: 0,
          team: "",
        },
      ])
    }
  }

  // 행 삭제
  const removeRow = (id: string) => {
    if (feeShares.length > 1) {
      setFeeShares(feeShares.filter((share) => share.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#1a1144]">Net Fee Sharing</h3>
          <p className="text-sm text-muted-foreground">
            총 수수료: {formatCurrency(totalAmount, currency)}
            {(currency === "KRW" || currency === "USD") && (
              <span className="text-xs ml-1">{getSecondaryCurrencyDisplay(totalAmount, currency)}</span>
            )}
            {hasThirdPartyVendor && thirdPartyAmount > 0 && (
              <>
                <br />
                3rd party Vendor 금액: {formatCurrency(thirdPartyAmount, currency)}
                {(currency === "KRW" || currency === "USD") && (
                  <span className="text-xs ml-1">{getSecondaryCurrencyDisplay(thirdPartyAmount, currency)}</span>
                )}
              </>
            )}
            <br />순 수수료: {formatCurrency(netAmount, currency)}
            {(currency === "KRW" || currency === "USD") && (
              <span className="text-xs ml-1">{getSecondaryCurrencyDisplay(netAmount, currency)}</span>
            )}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addRow}
          disabled={feeShares.length >= 10}
          className="bg-[#1a1144] hover:bg-[#2c1d5d] text-white"
        >
          <Plus className="mr-1 h-4 w-4" />행 추가
        </Button>
      </div>

      <div className="border rounded-md border-[#1a1144]">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-medium">이메일 *</TableHead>
              <TableHead className="font-medium">금액 ({currency}) *</TableHead>
              <TableHead className="font-medium">비율 (%) *</TableHead>
              <TableHead className="font-medium">팀 *</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeShares.map((share) => (
              <TableRow key={share.id}>
                <TableCell>
                  <Input
                    type="email"
                    value={share.email}
                    onChange={(e) => handleEmailChange(share.id, e.target.value)}
                    placeholder="이메일 주소"
                    className={!share.email ? "border-red-300" : ""}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={share.amount || ""}
                    onChange={(e) => handleAmountChange(share.id, Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={share.percentage || ""}
                    onChange={(e) => handlePercentageChange(share.id, Number(e.target.value) || 0)}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </TableCell>
                <TableCell>
                  <Select value={share.team} onValueChange={(value) => handleTeamChange(share.id, value)}>
                    <SelectTrigger className={!share.team ? "border-red-300" : ""}>
                      <SelectValue placeholder="팀 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(share.id)}
                    disabled={feeShares.length <= 1}
                    className="text-[#e31937] hover:text-[#c01730] hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between text-sm">
        <div>
          <span className="font-medium">총 비율:</span> {totalPercentage.toFixed(2)}%
          {Math.abs(totalPercentage - 100) > 0.01 && (
            <span className={`ml-2 ${totalPercentage < 100 ? "text-red-500" : "text-red-500"}`}>
              {totalPercentage < 100
                ? `(${(100 - totalPercentage).toFixed(2)}% 부족)`
                : `(${(totalPercentage - 100).toFixed(2)}% 초과)`}
            </span>
          )}
        </div>
        <div>
          <span className="font-medium">총 금액:</span> {formatCurrency(totalShareAmount, currency)}
          {(currency === "KRW" || currency === "USD") && (
            <span className="text-xs ml-1">{getSecondaryCurrencyDisplay(totalShareAmount, currency)}</span>
          )}
          {Math.abs(totalShareAmount - netAmount) > 1 && (
            <span className={`ml-2 ${totalShareAmount < netAmount ? "text-red-500" : "text-red-500"}`}>
              {totalShareAmount < netAmount
                ? `(${formatCurrency(netAmount - totalShareAmount, currency)} 부족)`
                : `(${formatCurrency(totalShareAmount - netAmount, currency)} 초과)`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
