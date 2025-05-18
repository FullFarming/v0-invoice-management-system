"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AutoComplete } from "@/components/auto-complete"
import { Plus, Trash } from "lucide-react"
import { suppliers } from "@/lib/data"
import { getSecondaryCurrencyDisplay } from "@/lib/currency"

interface VendorItem {
  id: string
  name: string
  amount: number
}

interface VendorSelectionProps {
  vendors: VendorItem[]
  onChange: (vendors: VendorItem[]) => void
  title: string
  nameLabel?: string
  amountLabel?: string
  currency?: string
}

export function VendorSelection({
  vendors,
  onChange,
  title,
  nameLabel = "Vendor 이름",
  amountLabel = "금액",
  currency = "KRW",
}: VendorSelectionProps) {
  const [newVendorName, setNewVendorName] = useState("")
  const [newVendorAmount, setNewVendorAmount] = useState("")

  const updateVendorAmount = (id: string, amount: string) => {
    const parsedAmount = Number.parseInt(amount, 10)
    if (!isNaN(parsedAmount)) {
      onChange(vendors.map((vendor) => (vendor.id === id ? { ...vendor, amount: parsedAmount } : vendor)))
    }
  }

  // 수정: 입력값이 빈 문자열일 때 0으로 처리하여 NaN 방지
  const addVendor = () => {
    if (newVendorName && newVendorAmount) {
      const amount = Number.parseInt(newVendorAmount, 10) || 0 // 0으로 기본값 설정
      const newVendor: VendorItem = {
        id: Date.now().toString(),
        name: newVendorName,
        amount: amount,
      }
      onChange([...vendors, newVendor])
      setNewVendorName("")
      setNewVendorAmount("")
    }
  }

  const removeVendor = (id: string) => {
    onChange(vendors.filter((vendor) => vendor.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="font-medium text-lg">{title}</div>

      {vendors.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{nameLabel}</TableHead>
              <TableHead>{`${amountLabel} (${currency})`}</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>
                  <div>
                    <Input
                      type="number"
                      value={vendor.amount}
                      onChange={(e) => updateVendorAmount(vendor.id, e.target.value)}
                      className="w-full"
                    />
                    {(currency === "KRW" || currency === "USD") && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {getSecondaryCurrencyDisplay(vendor.amount, currency)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVendor(vendor.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-end gap-2">
        <div className="space-y-2 flex-1">
          <Label htmlFor={`new-${title}-name`}>{nameLabel}</Label>
          <AutoComplete
            options={suppliers}
            value={newVendorName}
            onChange={setNewVendorName}
            placeholder={`${nameLabel} 선택 또는 입력`}
            emptyMessage="검색 결과가 없습니다."
          />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor={`new-${title}-amount`}>{`${amountLabel} (${currency})`}</Label>
          <Input
            id={`new-${title}-amount`}
            type="number"
            value={newVendorAmount}
            onChange={(e) => setNewVendorAmount(e.target.value)}
            placeholder="0"
          />
        </div>
        <Button
          type="button"
          onClick={addVendor}
          className="bg-[#1a1144] hover:bg-[#2c1d5d] text-white"
          disabled={!newVendorName || !newVendorAmount}
        >
          <Plus className="mr-1 h-4 w-4" />
          추가
        </Button>
      </div>
    </div>
  )
}
