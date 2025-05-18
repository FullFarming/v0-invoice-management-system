"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/file-upload"
import { useAuth } from "@/components/auth-provider"
import { AutoComplete } from "@/components/auto-complete"
import { suppliers } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { generateInvoiceNumber } from "@/lib/utils"
import { currencyOptions, formatCurrency, getSecondaryCurrencyDisplay } from "@/lib/currency"

// 벤더 아이템 인터페이스
interface VendorItem {
  id: string
  name: string
  amount: number
}

// 고객 인보이스 데이터 인터페이스
interface CustomerInvoiceData {
  invoiceNumber: string
  customerName: string
  projectName: string
  totalAmount: number
  currency: string
  thirdPartyVendor: boolean
  thirdPartyVendors: VendorItem[]
  hasCOSS?: boolean
  cossVendors?: VendorItem[]
  hasReferralFee?: boolean
  referralFees?: VendorItem[]
}

// 예시 고객 인보이스 데이터
const customerInvoices = [
  { id: "INV-2023-001", projectName: "ABC 회사 오피스 임대" },
  { id: "INV-2023-002", projectName: "XYZ 기업 상업용 부동산 매매" },
]

// Function to ensure unique invoice number (example implementation - replace with your actual logic)
const ensureUniqueInvoiceNumber = (invoiceNumber: string) => {
  // This is a placeholder - replace with your actual logic to check for uniqueness
  // and generate a new invoice number if necessary.
  // For example, you might check against a database or local storage.
  // For this example, we'll just add a random number to the end.
  return invoiceNumber + "-" + Math.floor(Math.random() * 1000)
}

export default function SupplierInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  // URL 파라미터에서 관련 인보이스 ID와 벤더 인덱스 가져오기
  const relatedInvoiceParam = searchParams.get("relatedInvoice")
  const vendorIndexParam = searchParams.get("vendorIndex")
  const vendorIndex = vendorIndexParam ? Number.parseInt(vendorIndexParam, 10) : 0

  // 관련 고객 인보이스
  const [relatedInvoiceId, setRelatedInvoiceId] = useState("")
  const [projectName, setProjectName] = useState("")
  const [isNewProject, setIsNewProject] = useState(false)
  const [customerInvoiceData, setCustomerInvoiceData] = useState<CustomerInvoiceData | null>(null)
  const [currentVendor, setCurrentVendor] = useState<VendorItem | null>(null)

  // Supplier 정보
  const [supplierName, setSupplierName] = useState("")
  const [supplierEmail, setSupplierEmail] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  // 인보이스 상세 정보
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("KRW") // 기본 통화는 KRW
  const [invoiceDate, setInvoiceDate] = useState("")
  const [paymentDueDate, setPaymentDueDate] = useState("")
  const [taxType, setTaxType] = useState("")

  // 필수 서류
  const [hasContract, setHasContract] = useState(false)
  const [hasBusinessRegistration, setHasBusinessRegistration] = useState(false)
  const [hasBankAccount, setHasBankAccount] = useState(false)
  const [hasTaxInvoice, setHasTaxInvoice] = useState(false)
  const [hasApprovalEmail, setHasApprovalEmail] = useState(false)

  // 추가 정보
  const [description, setDescription] = useState("")
  const [icaInfo, setIcaInfo] = useState("")

  // 인보이스 번호 생성 및 중복 확인 로직 수정
  // 인보이스 번호 (오늘 날짜 + 순차적 번호)
  const [invoiceNumber, setInvoiceNumber] = useState("")

  // 컴포넌트 마운트 시 인보이스 번호 생성
  useEffect(() => {
    const generatedNumber = generateInvoiceNumber("3P")
    setInvoiceNumber(generatedNumber)
  }, [])

  // 각 섹션의 완료 상태
  const [sectionStatus, setSectionStatus] = useState({
    relatedInvoice: false,
    supplierInfo: false,
    invoiceDetails: false,
    requiredDocuments: false,
    additionalInfo: true, // 선택 사항이므로 기본값 true
  })

  // 전체 진행률 계산
  const calculateProgress = () => {
    const sections = Object.values(sectionStatus)
    const completedSections = sections.filter(Boolean).length
    return Math.round((completedSections / sections.length) * 100)
  }

  // 각 섹션의 완료 상태 업데이트
  useEffect(() => {
    setSectionStatus({
      relatedInvoice: !!relatedInvoiceId && (relatedInvoiceId === "new" ? !!projectName : true),
      supplierInfo: !!supplierName && !!supplierEmail,
      invoiceDetails: !!amount && !!invoiceDate && !!paymentDueDate && !!taxType,
      requiredDocuments: hasContract && hasBusinessRegistration && hasBankAccount && hasApprovalEmail,
      additionalInfo: true, // 선택 사항
    })
  }, [
    relatedInvoiceId,
    projectName,
    supplierName,
    supplierEmail,
    amount,
    invoiceDate,
    paymentDueDate,
    taxType,
    hasContract,
    hasBusinessRegistration,
    hasBankAccount,
    hasApprovalEmail,
  ])

  // 관련 인보이스 선택 시 프로젝트명 자동 설정
  useEffect(() => {
    if (relatedInvoiceId && !isNewProject && !customerInvoiceData) {
      const selectedInvoice = customerInvoices.find((invoice) => invoice.id === relatedInvoiceId)
      if (selectedInvoice) {
        setProjectName(selectedInvoice.projectName)
      }
    }
  }, [relatedInvoiceId, isNewProject, customerInvoiceData])

  // 페이지 로드 시 관련 인보이스 정보 가져오기 위한 useEffect 추가
  useEffect(() => {
    // 로컬 스토리지에서 인보이스 목록 가져오기
    const storedInvoices = localStorage.getItem("invoices") || "[]"
    const invoices = JSON.parse(storedInvoices)

    if (relatedInvoiceParam) {
      // 관련 인보이스 찾기
      const relatedInvoice = invoices.find((invoice: any) => invoice.invoiceNumber === relatedInvoiceParam)

      if (relatedInvoice) {
        setCustomerInvoiceData(relatedInvoice)

        // 관련 인보이스 정보 설정
        setRelatedInvoiceId(relatedInvoiceParam)
        setProjectName(relatedInvoice.projectName || "")
        setCurrency(relatedInvoice.currency || "KRW") // 관련 인보이스의 통화 설정

        // 현재 처리 중인 벤더 정보 설정
        if (relatedInvoice.thirdPartyVendors && relatedInvoice.thirdPartyVendors.length > vendorIndex) {
          const vendor = relatedInvoice.thirdPartyVendors[vendorIndex]
          setCurrentVendor(vendor)
          setSupplierName(vendor.name)
          setAmount(vendor.amount.toString())

          toast({
            title: "관련 인보이스 정보 로드됨",
            description: `${relatedInvoiceParam} 인보이스와 연계된 3rd party Invoice를 작성합니다. (${vendorIndex + 1}/${relatedInvoice.thirdPartyVendors.length})`,
          })
        }
      }
    }
  }, [relatedInvoiceParam, vendorIndex, toast])

  // 제출 함수 수정 - 제출 시점에 인보이스 번호 중복 확인
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    if (!supplierName || !supplierEmail || !amount) {
      toast({
        title: "필수 정보 누락",
        description: "업체명, 업체 이메일, 금액은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    // 필수 서류 검증
    if (!hasContract || !hasBusinessRegistration || !hasBankAccount || !hasApprovalEmail) {
      toast({
        title: "필수 서류 누락",
        description: "계약서/견적서, 사업자등록증, 통장사본, 본부장 승인 메일은 필수 서류입니다.",
        variant: "destructive",
      })
      return
    }

    // 인보이스 번호 중복 확인 및 고유 번호 생성
    const uniqueInvoiceNumber = ensureUniqueInvoiceNumber(invoiceNumber)

    // 인보이스 번호가 변경되었다면 상태 업데이트
    if (uniqueInvoiceNumber !== invoiceNumber) {
      setInvoiceNumber(uniqueInvoiceNumber)
      toast({
        title: "인보이스 번호 변경",
        description: `중복 방지를 위해 인보이스 번호가 ${uniqueInvoiceNumber}로 변경되었습니다.`,
      })
    }

    // 인보이스 제출 처리 (실제로는 API 호출)
    toast({
      title: "인보이스 제출 완료",
      description: `Invoice No. ${uniqueInvoiceNumber}가 성공적으로 제출되었습니다.`,
    })

    // 인보이스 정보를 로컬 스토리지에 저장
    const invoiceData = {
      invoiceNumber: uniqueInvoiceNumber,
      supplierName,
      projectName,
      totalAmount: Number(amount),
      currency, // 통화 정보 추가
      relatedInvoice: relatedInvoiceId,
      status: "pending",
      currentApprovalStep: 1,
      createdBy: user?.email,
      createdAt: new Date().toISOString(),
      type: "supplier",
    }

    // 로컬 스토리지에 저장된 인보이스 목록 업데이트
    const storedInvoices = localStorage.getItem("invoices") || "[]"
    const invoices = JSON.parse(storedInvoices)
    invoices.push(invoiceData)
    localStorage.setItem("invoices", JSON.stringify(invoices))

    // 다음 벤더가 있는지 확인
    if (customerInvoiceData && customerInvoiceData.thirdPartyVendors) {
      const nextVendorIndex = vendorIndex + 1
      if (nextVendorIndex < customerInvoiceData.thirdPartyVendors.length) {
        // 다음 벤더로 이동
        router.push(`/invoices/supplier/new?relatedInvoice=${relatedInvoiceParam}&vendorIndex=${nextVendorIndex}`)
        return
      }
    }

    // 모든 벤더 처리 완료 또는 단일 벤더인 경우 대시보드로 이동
    router.push("/dashboard")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-[#1a1144] text-white p-6 rounded-md">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">3rd party Invoice</h1>
            <div className="mt-2 w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
            </div>
            <div className="text-sm mt-1">작성 진행률: {calculateProgress()}%</div>
          </div>
          <div className="bg-white text-[#1a1144] p-3 rounded-md flex items-center">
            <span className="text-sm font-medium mr-2">Invoice No.</span>
            <span className="font-mono font-bold">{invoiceNumber}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 관련 고객 인보이스 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                관련 고객 인보이스
                {sectionStatus.relatedInvoice && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="relatedInvoiceId" className="font-medium">
                    관련 Customer Invoice
                  </Label>
                  {customerInvoiceData ? (
                    <div className="p-3 border rounded-md bg-gray-50">
                      <div className="font-medium">{customerInvoiceData.invoiceNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {customerInvoiceData.customerName} - {customerInvoiceData.projectName}
                      </div>
                      <div className="text-sm mt-1">
                        통화: {customerInvoiceData.currency || "KRW"} | 금액:{" "}
                        {formatCurrency(customerInvoiceData.totalAmount, customerInvoiceData.currency || "KRW")}
                        {(customerInvoiceData.currency === "KRW" || customerInvoiceData.currency === "USD") && (
                          <span className="text-xs ml-1 text-muted-foreground">
                            {getSecondaryCurrencyDisplay(
                              customerInvoiceData.totalAmount,
                              customerInvoiceData.currency || "KRW",
                            )}
                          </span>
                        )}
                      </div>
                      {currentVendor && (
                        <div className="mt-2 p-2 border rounded-md bg-white">
                          <div className="text-sm font-medium">현재 처리 중인 Vendor:</div>
                          <div className="flex justify-between">
                            <span>{currentVendor.name}</span>
                            <span>
                              {formatCurrency(currentVendor.amount, customerInvoiceData.currency || "KRW")}
                              {(customerInvoiceData.currency === "KRW" || customerInvoiceData.currency === "USD") && (
                                <span className="text-xs ml-1 text-muted-foreground">
                                  {getSecondaryCurrencyDisplay(
                                    currentVendor.amount,
                                    customerInvoiceData.currency || "KRW",
                                  )}
                                </span>
                              )}
                            </span>
                          </div>
                          {customerInvoiceData.thirdPartyVendors && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {vendorIndex + 1}/{customerInvoiceData.thirdPartyVendors.length} Vendor
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Select
                      value={relatedInvoiceId}
                      onValueChange={(value) => {
                        setRelatedInvoiceId(value)
                        setIsNewProject(value === "new")
                      }}
                    >
                      <SelectTrigger id="relatedInvoiceId">
                        <SelectValue placeholder="관련 인보이스 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">신규 (관련 인보이스 없음)</SelectItem>
                        {customerInvoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.id} - {invoice.projectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {(relatedInvoiceId === "new" || isNewProject) && !customerInvoiceData && (
                  <div className="space-y-2">
                    <Label htmlFor="projectName" className="font-medium">
                      프로젝트명 *
                    </Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="프로젝트명을 입력하세요"
                      required
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Supplier 정보 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                Supplier 정보
                {sectionStatus.supplierInfo && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName" className="font-medium">
                      업체명 *
                    </Label>
                    <AutoComplete
                      options={suppliers}
                      value={supplierName}
                      onChange={setSupplierName}
                      placeholder="공급업체 선택"
                      emptyMessage="검색 결과가 없습니다."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierEmail" className="font-medium">
                      업체 이메일 *
                    </Label>
                    <Input
                      id="supplierEmail"
                      type="email"
                      value={supplierEmail}
                      onChange={(e) => setSupplierEmail(e.target.value)}
                      placeholder="업체 이메일을 입력하세요"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="font-medium">
                      담당자명
                    </Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="담당자명을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="font-medium">
                      담당자 연락처
                    </Label>
                    <Input
                      id="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="담당자 연락처를 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 인보이스 상세 정보 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                인보이스 상세 정보
                {sectionStatus.invoiceDetails && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="font-medium">
                      통화 *
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="통화 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="font-medium">
                      금액 *
                    </Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        required
                      />
                      {amount && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {getSecondaryCurrencyDisplay(Number(amount), currency)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate" className="font-medium">
                      인보이스 날짜 *
                    </Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => {
                        const newDate = e.target.value
                        setInvoiceDate(newDate)
                        // 지급 예정일이 비어있거나 이전에 인보이스 날짜와 동일했던 경우에만 동기화
                        if (!paymentDueDate || paymentDueDate === invoiceDate) {
                          setPaymentDueDate(newDate)
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDueDate" className="font-medium">
                      지급 예정일 *
                    </Label>
                    <Input
                      id="paymentDueDate"
                      type="date"
                      value={paymentDueDate}
                      onChange={(e) => setPaymentDueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxType" className="font-medium">
                      세금 유형 *
                    </Label>
                    <Select value={taxType} onValueChange={setTaxType}>
                      <SelectTrigger id="taxType">
                        <SelectValue placeholder="세금 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vat">부가가치세 포함</SelectItem>
                        <SelectItem value="noVat">부가가치세 면제</SelectItem>
                        <SelectItem value="withholding">원천징수세 적용</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 필수 서류 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                필수 서류
                {sectionStatus.requiredDocuments && (
                  <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <FileUpload
                  label="계약서 및 견적서 (PDF) *"
                  id="contract"
                  accept=".pdf"
                  onUpload={() => setHasContract(true)}
                  required
                />
                <FileUpload
                  label="사업자등록증 (PDF) *"
                  id="businessRegistration"
                  accept=".pdf"
                  onUpload={() => setHasBusinessRegistration(true)}
                  required
                />
                <FileUpload
                  label="통장사본 (PDF) *"
                  id="bankAccount"
                  accept=".pdf"
                  onUpload={() => setHasBankAccount(true)}
                  required
                />
                <FileUpload
                  label="전자세금계산서 (PDF)"
                  id="taxInvoice"
                  accept=".pdf"
                  onUpload={() => setHasTaxInvoice(true)}
                  required={false}
                />
                <FileUpload
                  label="본부장 승인 메일 (PDF) *"
                  id="approvalEmail"
                  accept=".pdf"
                  onUpload={() => setHasApprovalEmail(true)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                추가 정보 (선택사항)
                {sectionStatus.additionalInfo && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium">
                    세부 설명
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="인보이스에 대한 세부 설명을 입력하세요"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icaInfo" className="font-medium">
                    ICA 정보
                  </Label>
                  <Input
                    id="icaInfo"
                    value={icaInfo}
                    onChange={(e) => setIcaInfo(e.target.value)}
                    placeholder="ICA 정보를 입력하세요"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-[#1a1144] text-[#1a1144] hover:bg-[#1a1144] hover:text-white"
            >
              취소
            </Button>
            <Button type="submit" size="lg" className="bg-[#e31937] hover:bg-[#c01730] text-white">
              인보이스 제출
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
