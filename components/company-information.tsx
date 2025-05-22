"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Building, Mail, MapPin, FileText } from "lucide-react"
import type { Company } from "@/lib/company-data"

interface CompanyInformationProps {
  selectedCompany: Company | null
  onSaveNewCompany: (company: Company) => void
  type: "customer" | "supplier"
}

export function CompanyInformation({ selectedCompany, onSaveNewCompany, type }: CompanyInformationProps) {
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false)
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: "",
    businessNumber: "",
    contactEmail: "",
    companyEmail: "",
    address: "",
    type: type,
  })

  const handleInputChange = (field: keyof Company, value: string) => {
    setNewCompany((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveNewCompany = () => {
    if (!newCompany.name || !newCompany.businessNumber) {
      alert("회사명과 사업자 등록번호는 필수 입력 항목입니다.")
      return
    }

    onSaveNewCompany({
      id: Date.now().toString(),
      name: newCompany.name || "",
      businessNumber: newCompany.businessNumber || "",
      contactEmail: newCompany.contactEmail || "",
      companyEmail: newCompany.companyEmail || "",
      address: newCompany.address || "",
      type: type,
    })

    setShowNewCompanyDialog(false)
    setNewCompany({
      name: "",
      businessNumber: "",
      contactEmail: "",
      companyEmail: "",
      address: "",
      type: type,
    })
  }

  if (!selectedCompany) {
    return (
      <div className="mt-2 flex items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNewCompanyDialog(true)}
          className="flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          신규 {type === "customer" ? "고객사" : "공급업체"} 추가
        </Button>

        <Dialog open={showNewCompanyDialog} onOpenChange={setShowNewCompanyDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>신규 {type === "customer" ? "고객사" : "공급업체"} 추가</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {type === "customer" ? "고객사명" : "공급업체명"} *
                </Label>
                <Input
                  id="name"
                  value={newCompany.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="businessNumber" className="text-right">
                  사업자 등록번호 *
                </Label>
                <Input
                  id="businessNumber"
                  value={newCompany.businessNumber || ""}
                  onChange={(e) => handleInputChange("businessNumber", e.target.value)}
                  placeholder="000-00-00000"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactEmail" className="text-right">
                  담당자 이메일
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newCompany.contactEmail || ""}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyEmail" className="text-right">
                  회사 이메일
                </Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={newCompany.companyEmail || ""}
                  onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  주소
                </Label>
                <Input
                  id="address"
                  value={newCompany.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewCompanyDialog(false)}>
                취소
              </Button>
              <Button type="button" onClick={handleSaveNewCompany}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Card className="mt-4 border-dashed">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start">
            <FileText className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium">사업자 등록번호</div>
              <div className="text-sm">{selectedCompany.businessNumber || "정보 없음"}</div>
            </div>
          </div>
          <div className="flex items-start">
            <Mail className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium">담당자 이메일</div>
              <div className="text-sm">{selectedCompany.contactEmail || "정보 없음"}</div>
            </div>
          </div>
          <div className="flex items-start">
            <Building className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium">회사 이메일</div>
              <div className="text-sm">{selectedCompany.companyEmail || "정보 없음"}</div>
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium">주소</div>
              <div className="text-sm">{selectedCompany.address || "정보 없음"}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
