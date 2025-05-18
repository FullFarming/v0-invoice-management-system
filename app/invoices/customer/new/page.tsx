"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/file-upload"
import { FeeSharing } from "@/components/fee-sharing"
import { useAuth } from "@/components/auth-provider"
import { AutoComplete } from "@/components/auto-complete"
import { MultiEmailInput } from "@/components/multi-email-input"
import { customers } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { generateInvoiceNumber } from "@/lib/utils"
import { VendorSelection } from "@/components/vendor-selection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApproverSelection, type Approver } from "@/components/approver-selection"
import { currencyOptions, formatCurrency, getSecondaryCurrencyDisplay } from "@/lib/currency"

// 벤더 아이템 인터페이스
interface VendorItem {
  id: string
  name: string
  amount: number
}

export default function CustomerInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // 고객 정보
  const [customerName, setCustomerName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [feeForecastReflection, setFeeForecastReflection] = useState(false)

  // 인보이스 상세 정보
  const [managerEmailList, setManagerEmailList] = useState<string[]>([])
  const [customerEmailList, setCustomerEmailList] = useState<string[]>([])
  const [taxInvoiceDate, setTaxInvoiceDate] = useState("")
  const [customerRequestDate, setCustomerRequestDate] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [currency, setCurrency] = useState("KRW") // 기본 통화는 KRW

  // 필수 서류
  const [hasContract, setHasContract] = useState(false)
  const [hasBusinessRegistration, setHasBusinessRegistration] = useState(false)
  const [hasApprovalEmail, setHasApprovalEmail] = useState(false)
  const [hasRefundClause, setHasRefundClause] = useState(false)
  const [hasLeaseContract, setHasLeaseContract] = useState(false)

  // 3rd party Vendor 정보
  const [hasThirdPartyVendor, setHasThirdPartyVendor] = useState(false)
  const [thirdPartyVendors, setThirdPartyVendors] = useState<VendorItem[]>([])

  // COSS 정보
  const [hasCOSS, setHasCOSS] = useState(false)
  const [cossVendors, setCossVendors] = useState<VendorItem[]>([])

  // Referral fee 정보
  const [hasReferralFee, setHasReferralFee] = useState(false)
  const [referralFees, setReferralFees] = useState<VendorItem[]>([])

  // Transaction 정보
  const [transactionType, setTransactionType] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [squareFeet, setSquareFeet] = useState("")
  const [leaseTerm, setLeaseTerm] = useState("")
  const [priceOrRent, setPriceOrRent] = useState("")

  // 계산 근거
  const [calculationBasis, setCalculationBasis] = useState("")

  // Fee Sharing 상태
  const [feeSharingComplete, setFeeSharingComplete] = useState(false)

  // 승인 워크플로우
  const [approvers, setApprovers] = useState<Approver[]>([])

  // 인보이스 번호 생성 및 중복 확인 로직 수정
  // 인보이스 번호 (오늘 날짜 + 순차적 번호)
  const [invoiceNumber, setInvoiceNumber] = useState("")

  // 컴포넌트 마운트 시 인보이스 번호 생성
  useEffect(() => {
    const generatedNumber = generateInvoiceNumber("CI")
    setInvoiceNumber(generatedNumber)
  }, [])

  // 각 섹션의 완료 상태
  const [sectionStatus, setSectionStatus] = useState({
    customerInfo: false,
    invoiceDetails: false,
    requiredDocuments: false,
    thirdPartyVendor: true, // 선택 사항이므로 기본값 true
    coss: true, // 선택 사항이므로 기본값 true
    referralFee: true, // 선택 사항이므로 기본값 true
    feeSharing: false, // 필수 항목으로 변경
    transactionInfo: true, // 선택 사항이므로 기본값 true
    calculationBasis: false,
    approvalWorkflow: false, // 승인 워크플로우 추가
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
      customerInfo: !!customerName && !!projectName,
      invoiceDetails:
        managerEmailList.length > 0 &&
        customerEmailList.length > 0 &&
        !!taxInvoiceDate &&
        !!customerRequestDate &&
        !!totalAmount,
      requiredDocuments: hasContract && hasBusinessRegistration && hasApprovalEmail,
      thirdPartyVendor: !hasThirdPartyVendor || (hasThirdPartyVendor && thirdPartyVendors.length > 0),
      coss: !hasCOSS || (hasCOSS && cossVendors.length > 0),
      referralFee: !hasReferralFee || (hasReferralFee && referralFees.length > 0),
      feeSharing: feeSharingComplete, // Fee Sharing 완료 상태 반영
      transactionInfo: true, // 선택 사항
      calculationBasis: !!calculationBasis,
      approvalWorkflow: approvers.length > 0, // 최소 한 명의 승인자가 있어야 함
    })
  }, [
    customerName,
    projectName,
    managerEmailList,
    customerEmailList,
    taxInvoiceDate,
    customerRequestDate,
    totalAmount,
    hasContract,
    hasBusinessRegistration,
    hasApprovalEmail,
    hasThirdPartyVendor,
    thirdPartyVendors,
    hasCOSS,
    cossVendors,
    hasReferralFee,
    referralFees,
    feeSharingComplete,
    calculationBasis,
    approvers.length,
  ])

  // Fee Sharing 완료 상태 업데이트 콜백
  const handleFeeSharingComplete = (isComplete: boolean) => {
    setFeeSharingComplete(isComplete)
  }

  // 3rd party Vendor 총액 계산
  const calculateThirdPartyTotal = () => {
    return thirdPartyVendors.reduce((sum, vendor) => sum + vendor.amount, 0)
  }

  // 수정: 미리 계산된 값을 사용하여 불필요한 재계산 방지
  const thirdPartyTotal = calculateThirdPartyTotal()

  // 제출 함수 수정 - 3rd party Vendor가 체크되었을 때 공급업체 인보이스 신청으로 연계
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    if (!customerName || !projectName || !totalAmount) {
      toast({
        title: "필수 정보 누락",
        description: "고객사명, 프로젝트명, 총 금액은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    // 필수 서류 검증
    if (!hasContract || !hasBusinessRegistration || !hasApprovalEmail) {
      toast({
        title: "필수 서류 누락",
        description: "날인된 용역계약서, 사업자등록증, 승인 메일은 필수 서류입니다.",
        variant: "destructive",
      })
      return
    }

    // Fee Sharing 검증
    if (!feeSharingComplete) {
      toast({
        title: "Fee Sharing 정보 누락",
        description: "Net Fee Sharing 정보를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 3rd party Vendor 검증
    if (hasThirdPartyVendor && thirdPartyVendors.length === 0) {
      toast({
        title: "3rd party Vendor 정보 누락",
        description: "3rd party Vendor를 추가해주세요.",
        variant: "destructive",
      })
      return
    }

    // COSS 검증
    if (hasCOSS && cossVendors.length === 0) {
      toast({
        title: "COSS 정보 누락",
        description: "COSS 정보를 추가해주세요.",
        variant: "destructive",
      })
      return
    }

    // Referral fee 검증
    if (hasReferralFee && referralFees.length === 0) {
      toast({
        title: "Referral fee 정보 누락",
        description: "Referral fee 정보를 추가해주세요.",
        variant: "destructive",
      })
      return
    }

    // 승인 워크플로우 검증
    if (approvers.length === 0) {
      toast({
        title: "승인 워크플로우 정보 누락",
        description: "최소 한 명의 승인자를 지정해주세요.",
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
      description: `Invoice No. ${uniqueInvoiceNumber}가 성공적으로 제출되었습니다. 승인 절차가 시작됩니다.`,
    })

    // 인보이스 정보를 로컬 스토리지에 저장
    const invoiceData = {
      invoiceNumber: uniqueInvoiceNumber,
      customerName,
      projectName,
      totalAmount: Number(totalAmount),
      currency, // 통화 정보 추가
      thirdPartyVendor: hasThirdPartyVendor,
      thirdPartyVendors: thirdPartyVendors,
      hasCOSS: hasCOSS,
      cossVendors: cossVendors,
      hasReferralFee: hasReferralFee,
      referralFees: referralFees,
      approvers: approvers,
      status: "pending",
      currentApprovalStep: 1,
      createdBy: user?.email,
      createdAt: new Date().toISOString(),
      type: "customer",
    }

    // 로컬 스토리지에 저장된 인보이스 목록 업데이트
    const storedInvoices = localStorage.getItem("invoices") || "[]"
    const invoices = JSON.parse(storedInvoices)
    invoices.push(invoiceData)
    localStorage.setItem("invoices", JSON.stringify(invoices))

    // 3rd party Vendor가 있는 경우 공급업체 인보이스 신청 페이지로 이동
    if (hasThirdPartyVendor && thirdPartyVendors.length > 0) {
      router.push("/invoices/supplier/new?relatedInvoice=" + uniqueInvoiceNumber + "&vendorIndex=0")
    } else {
      // 3rd party Vendor가 없는 경우 대시보드로 이동
      router.push("/dashboard")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-[#1a1144] text-white p-6 rounded-md">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">Customer Invoice</h1>
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
          {/* 고객 정보 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                고객 정보
                {sectionStatus.customerInfo && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="font-medium">
                      고객사명 *
                    </Label>
                    <AutoComplete
                      options={customers}
                      value={customerName}
                      onChange={setCustomerName}
                      placeholder="고객사 선택"
                      emptyMessage="검색 결과가 없습니다."
                    />
                  </div>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectDescription" className="font-medium">
                    프로젝트 설명
                  </Label>
                  <Textarea
                    id="projectDescription"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="프로젝트에 대한 간략한 설명을 입력하세요"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="feeForecastReflection"
                    checked={feeForecastReflection}
                    onCheckedChange={(checked) => setFeeForecastReflection(checked as boolean)}
                  />
                  <Label htmlFor="feeForecastReflection" className="font-medium">
                    Fee Forecast 반영 여부
                  </Label>
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
                    <Label htmlFor="managerEmails" className="font-medium">
                      담당자 이메일 (복수 기재 가능) *
                    </Label>
                    <MultiEmailInput
                      options={[]}
                      values={managerEmailList}
                      onChange={setManagerEmailList}
                      placeholder="담당자 이메일 입력"
                      emptyMessage="이메일을 직접 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmails" className="font-medium">
                      고객사 이메일 (복수 기재 가능) *
                    </Label>
                    <MultiEmailInput
                      options={[]}
                      values={customerEmailList}
                      onChange={setCustomerEmailList}
                      placeholder="고객사 이메일 입력"
                      emptyMessage="이메일을 직접 입력하세요"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="taxInvoiceDate" className="font-medium">
                      세금계산서 발행일 *
                    </Label>
                    <Input
                      id="taxInvoiceDate"
                      type="date"
                      value={taxInvoiceDate}
                      onChange={(e) => {
                        const newDate = e.target.value
                        setTaxInvoiceDate(newDate)
                        // 고객사 요청일이 비어있거나 이전에 세금계산서 발행일과 동일했던 경우에만 동기화
                        if (!customerRequestDate || customerRequestDate === taxInvoiceDate) {
                          setCustomerRequestDate(newDate)
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerRequestDate" className="font-medium">
                      고객사 요청일 *
                    </Label>
                    <Input
                      id="customerRequestDate"
                      type="date"
                      value={customerRequestDate}
                      onChange={(e) => setCustomerRequestDate(e.target.value)}
                      required
                    />
                  </div>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount" className="font-medium">
                    총 금액 *
                  </Label>
                  <div className="relative">
                    <Input
                      id="totalAmount"
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      placeholder="0"
                      required
                    />
                    {totalAmount && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {getSecondaryCurrencyDisplay(Number(totalAmount), currency)}
                      </div>
                    )}
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
                  label="날인된 용역계약서 (PDF) *"
                  id="contract"
                  accept=".pdf"
                  onUpload={() => setHasContract(true)}
                  required
                />
                <FileUpload
                  label="사업자등록증 (PDF 또는 이미지) *"
                  id="businessRegistration"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onUpload={() => setHasBusinessRegistration(true)}
                  required
                />
                <FileUpload
                  label="승인 메일 (PDF) *"
                  id="approvalEmail"
                  accept=".pdf"
                  onUpload={() => setHasApprovalEmail(true)}
                  required
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="refundClause"
                    checked={hasRefundClause}
                    onCheckedChange={(checked) => setHasRefundClause(checked as boolean)}
                  />
                  <Label htmlFor="refundClause" className="font-medium">
                    Refund 조항
                  </Label>
                </div>
                <FileUpload
                  label="임대차 계약서 (선택사항)"
                  id="leaseContract"
                  accept=".pdf"
                  onUpload={() => setHasLeaseContract(true)}
                  required={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* 3rd party Vendor 정보 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                3rd party Vendor 정보
                {sectionStatus.thirdPartyVendor && (
                  <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasThirdPartyVendor"
                    checked={hasThirdPartyVendor}
                    onCheckedChange={(checked) => setHasThirdPartyVendor(checked as boolean)}
                  />
                  <Label htmlFor="hasThirdPartyVendor" className="font-medium">
                    3rd party Vendor 있음
                  </Label>
                </div>

                {hasThirdPartyVendor && (
                  <div className="mt-4 border rounded-md p-4">
                    <VendorSelection
                      vendors={thirdPartyVendors}
                      onChange={setThirdPartyVendors}
                      title="3rd party Vendors"
                      currency={currency}
                    />

                    {thirdPartyVendors.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium">
                          총 3rd party Vendor 금액: {formatCurrency(calculateThirdPartyTotal(), currency)}
                        </div>
                        {(currency === "KRW" || currency === "USD") && (
                          <div className="text-xs text-muted-foreground">
                            {getSecondaryCurrencyDisplay(calculateThirdPartyTotal(), currency)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 text-sm text-muted-foreground">
                      3rd party Vendor가 있는 경우, 인보이스 제출 후 자동으로 3rd party Invoice 페이지로 이동합니다.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* COSS 및 Referral Fee 정보 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                COSS 및 Referral Fee
                {sectionStatus.coss && sectionStatus.referralFee && (
                  <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="coss" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="coss">COSS</TabsTrigger>
                  <TabsTrigger value="referral">Referral Fee</TabsTrigger>
                </TabsList>

                <TabsContent value="coss">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasCOSS"
                        checked={hasCOSS}
                        onCheckedChange={(checked) => setHasCOSS(checked as boolean)}
                      />
                      <Label htmlFor="hasCOSS" className="font-medium">
                        COSS 있음
                      </Label>
                    </div>

                    {hasCOSS && (
                      <div className="mt-4 border rounded-md p-4">
                        <VendorSelection
                          vendors={cossVendors}
                          onChange={setCossVendors}
                          title="COSS"
                          currency={currency}
                        />

                        {cossVendors.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium">
                              총 COSS 금액:{" "}
                              {formatCurrency(
                                cossVendors.reduce((sum, vendor) => sum + vendor.amount, 0),
                                currency,
                              )}
                            </div>
                            {(currency === "KRW" || currency === "USD") && (
                              <div className="text-xs text-muted-foreground">
                                {getSecondaryCurrencyDisplay(
                                  cossVendors.reduce((sum, vendor) => sum + vendor.amount, 0),
                                  currency,
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="referral">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasReferralFee"
                        checked={hasReferralFee}
                        onCheckedChange={(checked) => setHasReferralFee(checked as boolean)}
                      />
                      <Label htmlFor="hasReferralFee" className="font-medium">
                        Referral Fee 있음
                      </Label>
                    </div>

                    {hasReferralFee && (
                      <div className="mt-4 border rounded-md p-4">
                        <VendorSelection
                          vendors={referralFees}
                          onChange={setReferralFees}
                          title="Referral Fee"
                          nameLabel="Company"
                          amountLabel={`금액 (${currency})`}
                          currency={currency}
                        />

                        {referralFees.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium">
                              총 Referral Fee 금액:{" "}
                              {formatCurrency(
                                referralFees.reduce((sum, fee) => sum + fee.amount, 0),
                                currency,
                              )}
                            </div>
                            {(currency === "KRW" || currency === "USD") && (
                              <div className="text-xs text-muted-foreground">
                                {getSecondaryCurrencyDisplay(
                                  referralFees.reduce((sum, fee) => sum + fee.amount, 0),
                                  currency,
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 text-sm text-muted-foreground">
                          Referral Fee는 다른 지사에 보내야 하는 금액입니다.
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Net Fee Sharing */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144] flex items-center">
                Net Fee Sharing
                <span className="text-red-500 ml-1">*</span>
                {sectionStatus.feeSharing && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <FeeSharing
                totalAmount={totalAmount ? Number.parseInt(totalAmount) : 0}
                hasThirdPartyVendor={hasThirdPartyVendor}
                thirdPartyAmount={thirdPartyTotal}
                onComplete={handleFeeSharingComplete}
                currency={currency}
              />
            </CardContent>
          </Card>

          {/* Transaction 정보 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                Transaction 정보 (선택사항)
                {sectionStatus.transactionInfo && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="transactionType" className="font-medium">
                      Transaction Type
                    </Label>
                    <Select value={transactionType} onValueChange={setTransactionType}>
                      <SelectTrigger id="transactionType">
                        <SelectValue placeholder="Transaction Type 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lease">임대 (Lease)</SelectItem>
                        <SelectItem value="sale">매매 (Sale)</SelectItem>
                        <SelectItem value="investment">투자 (Investment)</SelectItem>
                        <SelectItem value="other">기타 (Other)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="font-medium">
                      Property Type
                    </Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger id="propertyType">
                        <SelectValue placeholder="Property Type 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">오피스</SelectItem>
                        <SelectItem value="retail">리테일</SelectItem>
                        <SelectItem value="industrial">산업시설</SelectItem>
                        <SelectItem value="residential">주거시설</SelectItem>
                        <SelectItem value="mixed">복합시설</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="squareFeet" className="font-medium">
                      Sq.Ft (면적)
                    </Label>
                    <Input
                      id="squareFeet"
                      type="number"
                      value={squareFeet}
                      onChange={(e) => setSquareFeet(e.target.value)}
                      placeholder="면적 (평방피트)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaseTerm" className="font-medium">
                      Lease Term (임대기간, 개월)
                    </Label>
                    <Input
                      id="leaseTerm"
                      type="number"
                      value={leaseTerm}
                      onChange={(e) => setLeaseTerm(e.target.value)}
                      placeholder="임대기간 (개월)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceOrRent" className="font-medium">
                      {transactionType === "lease" ? `1개월 임대료 (${currency})` : `매매가 (${currency})`}
                    </Label>
                    <Input
                      id="priceOrRent"
                      type="number"
                      value={priceOrRent}
                      onChange={(e) => setPriceOrRent(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계산 근거 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                청구 금액 계산 근거
                {sectionStatus.calculationBasis && (
                  <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Label htmlFor="calculationBasis" className="font-medium">
                  청구하는 금액의 계산 근거를 상세히 기술해주세요.
                </Label>
                <Textarea
                  id="calculationBasis"
                  value={calculationBasis}
                  onChange={(e) => setCalculationBasis(e.target.value)}
                  placeholder="예: 계약서 제5조에 따른 성공보수 산정 - 연간 임대료의 4%"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* 승인 워크플로우 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144] flex items-center">
                승인 워크플로우
                <span className="text-red-500 ml-1">*</span>
                {sectionStatus.approvalWorkflow && (
                  <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ApproverSelection approvers={approvers} onChange={setApprovers} currentUserEmail={user?.email} />
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

// Function to ensure unique invoice number
async function ensureUniqueInvoiceNumber(invoiceNumber: string): Promise<string> {
  let uniqueInvoiceNumber = invoiceNumber
  let counter = 1

  while (await invoiceNumberExists(uniqueInvoiceNumber)) {
    uniqueInvoiceNumber = `${invoiceNumber}-${counter}`
    counter++
  }

  return uniqueInvoiceNumber
}

// Dummy function to simulate checking if invoice number exists (replace with actual API call)
async function invoiceNumberExists(invoiceNumber: string): Promise<boolean> {
  // Replace this with your actual logic to check if the invoice number exists in the database
  // This is just a placeholder to simulate the check
  const storedInvoices = localStorage.getItem("invoices") || "[]"
  const invoices = JSON.parse(storedInvoices)
  return invoices.some((invoice: any) => invoice.invoiceNumber === invoiceNumber)
}
