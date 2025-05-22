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
// import { CustomerSelect } from "@/components/customer-select"
import { MultiEmailInput } from "@/components/multi-email-input"
// import { EmployeeEmailInput } from "@/components/employee-email-input"
import { vendors } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Info, Plus, Trash2 } from "lucide-react"
import { generateInvoiceNumber } from "@/lib/utils"
import { VendorSelection } from "@/components/vendor-selection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApproverSelection, type Approver } from "@/components/approver-selection"
import { currencyOptions, formatCurrency, getSecondaryCurrencyDisplay } from "@/lib/currency"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AutoComplete } from "@/components/auto-complete"

// 벤더 아이템 인터페이스
interface VendorItem {
  id: string
  name: string
  amount: number
}

// 고객사 정보 인터페이스
interface CustomerInfo {
  id: string
  name: string
  businessNumber: string
  address: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

// 수혜자 정보 인터페이스
interface Beneficiary {
  id: string
  name: string
  email: string
  sharePercentage: number
}

export default function PlusOnePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // 고객 정보
  const [customerName, setCustomerName] = useState("")
  const [newCustomerData, setNewCustomerData] = useState<{ id: string; name: string } | null>(null)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [feeForecastReflection, setFeeForecastReflection] = useState(false)

  // 추가된 고객 정보 필드
  const [businessNumber, setBusinessNumber] = useState("")
  const [address, setAddress] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  // 기존 고객사 정보
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState<CustomerInfo | null>(null)

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

  // DFC 정보 추가
  const [hasDFC, setHasDFC] = useState(false)
  const [dfcVendors, setDFCVendors] = useState<VendorItem[]>([])

  // Plus One 정보 - 다수의 수혜자 지원
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: `beneficiary-${Date.now()}`, name: "", email: "", sharePercentage: 100 },
  ])
  const [isCompetitiveWin, setIsCompetitiveWin] = useState(false)
  const [referralAmount, setReferralAmount] = useState(0)
  const [referralNotes, setReferralNotes] = useState("")
  const [useCustomRate, setUseCustomRate] = useState(false) // 사용자 정의 요율 사용 여부

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

  // 정책 다이얼로그 상태
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false)

  // 인보이스 번호 생성 및 중복 확인 로직 수정
  // 인보이스 번호 (오늘 날짜 + 순차적 번호)
  const [invoiceNumber, setInvoiceNumber] = useState("")

  // 컴포넌트 마운트 시 인보이스 번호 생성
  useEffect(() => {
    const generatedNumber = generateInvoiceNumber("PO")
    setInvoiceNumber(generatedNumber)
  }, [])

  // 새 고객사 처리
  const handleNewCustomer = (name: string) => {
    // 이름이 비어있으면 초기화만 하고 리턴
    if (!name) {
      // 신규 고객사 선택 시 기존 정보 초기화
      setNewCustomerData(null)
      setSelectedCustomerInfo(null)
      setBusinessNumber("")
      setAddress("")
      setContactName("")
      setContactEmail("")
      setContactPhone("")

      // 고객사 이메일 리스트 초기화
      setCustomerEmailList([])
      return
    }

    const newCustomerId = `new-customer-${Date.now()}`
    setNewCustomerData({ id: newCustomerId, name })

    // 신규 고객사 선택 시 기존 정보 초기화
    setSelectedCustomerInfo(null)
    setBusinessNumber("")
    setAddress("")
    setContactName("")
    setContactPhone("")

    // 고객사 이메일 리스트 초기화
    setCustomerEmailList([])
  }

  // 기존 고객사 처리
  const handleExistingCustomer = (customerId: string) => {
    // 신규 고객사 데이터 초기화
    setNewCustomerData(null)

    // 선택된 고객사 정보 검색
    const vendor = vendors.find((v) => v.id === customerId)

    if (vendor) {
      const customerInfo: CustomerInfo = {
        id: vendor.id,
        name: vendor.name,
        businessNumber: vendor.businessNumber,
        address: vendor.address || "",
        contactName: vendor.contactName,
        contactEmail: vendor.contactEmail,
        contactPhone: vendor.contactPhone,
      }

      setSelectedCustomerInfo(customerInfo)

      // 고객사 이메일 자동 설정
      if (vendor.contactEmail) {
        setCustomerEmailList([vendor.contactEmail])
      }
    }
  }

  // 각 섹션의 완료 상태
  const [sectionStatus, setSectionStatus] = useState({
    customerInfo: false,
    invoiceDetails: false,
    requiredDocuments: false,
    thirdPartyVendor: true, // 선택 사항이므로 기본값 true
    coss: true, // 선택 사항이므로 기본값 true
    referralFee: true, // 선택 사항이므로 기본값 true
    dfc: true, // 선택 사항이므로 기본값 true
    plusOneInfo: false,
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
    // 수혜자 정보가 모두 입력되었는지 확인
    const beneficiariesComplete = beneficiaries.length > 0 && beneficiaries.every((b) => b.name && b.email)

    // 수혜자 지분 합계가 100%인지 확인
    const totalSharePercentage = beneficiaries.reduce((sum, b) => sum + b.sharePercentage, 0)
    const sharePercentageValid = totalSharePercentage === 100

    setSectionStatus({
      customerInfo: !!customerName && !!projectName && (newCustomerData ? !!businessNumber && !!address : true),
      invoiceDetails:
        managerEmailList.length > 0 &&
        customerEmailList.length > 0 &&
        !!taxInvoiceDate &&
        !!customerRequestDate &&
        !!totalAmount,
      requiredDocuments: hasContract && hasBusinessRegistration,
      thirdPartyVendor: !hasThirdPartyVendor || (hasThirdPartyVendor && thirdPartyVendors.length > 0),
      coss: !hasCOSS || (hasCOSS && cossVendors.length > 0),
      referralFee: !hasReferralFee || (hasReferralFee && referralFees.length > 0),
      dfc: !hasDFC || (hasDFC && dfcVendors.length > 0),
      plusOneInfo: beneficiariesComplete && sharePercentageValid,
      feeSharing: feeSharingComplete, // Fee Sharing 완료 상태 반영
      transactionInfo: true, // 선택 사항
      calculationBasis: !!calculationBasis,
      approvalWorkflow: approvers.length > 0, // 최소 한 명의 승인자가 있어야 함
    })
  }, [
    customerName,
    projectName,
    businessNumber,
    address,
    managerEmailList,
    customerEmailList,
    taxInvoiceDate,
    customerRequestDate,
    totalAmount,
    hasContract,
    hasBusinessRegistration,
    hasThirdPartyVendor,
    thirdPartyVendors,
    hasCOSS,
    cossVendors,
    hasReferralFee,
    referralFees,
    hasDFC,
    dfcVendors,
    beneficiaries,
    feeSharingComplete,
    calculationBasis,
    approvers.length,
    newCustomerData,
  ])

  // Fee Sharing 완료 상태 업데이트 콜백
  const handleFeeSharingComplete = (isComplete: boolean) => {
    setFeeSharingComplete(isComplete)
  }

  // 3rd party Vendor 총액 계산
  const calculateThirdPartyTotal = () => {
    return thirdPartyVendors.reduce((sum, vendor) => sum + vendor.amount, 0)
  }

  // COSS 총액 계산
  const calculateCOSSTotal = () => {
    return cossVendors.reduce((sum, vendor) => sum + vendor.amount, 0)
  }

  // Referral Fee 총액 계산
  const calculateReferralFeeTotal = () => {
    return referralFees.reduce((sum, fee) => sum + fee.amount, 0)
  }

  // DFC 총액 계산
  const calculateDFCTotal = () => {
    return dfcVendors.reduce((sum, dfc) => sum + dfc.amount, 0)
  }

  // 수정: 미리 계산된 값을 사용하여 불필요한 재계산 방지
  const thirdPartyTotal = calculateThirdPartyTotal()
  const cossTotal = calculateCOSSTotal()
  const referralFeeTotal = calculateReferralFeeTotal()
  const dfcTotal = calculateDFCTotal()

  // Net Revenue 계산 및 Plus One 금액 자동 계산
  useEffect(() => {
    const grossAmount = Number(totalAmount) || 0
    const thirdPartyAmt = thirdPartyTotal
    const calculatedNetRevenue = Math.max(0, grossAmount - thirdPartyAmt)

    // 새로운 정책에 따라 Plus One 금액 계산
    let calculatedReferralAmount = 0

    if (useCustomRate) {
      // 사용자 정의 요율 사용 시 (현재는 사용하지 않음)
      calculatedReferralAmount = 0
    } else {
      // 정책에 따른 자동 계산
      if (calculatedNetRevenue < 10000000) {
        // 1천만원 미만: 지급 제외
        calculatedReferralAmount = 0
      } else if (calculatedNetRevenue < 50000000) {
        // 1천만원 이상 ~ 5천만원 미만: 50만원
        calculatedReferralAmount = 500000
      } else if (calculatedNetRevenue < 1000000000) {
        // 5천만원 이상 ~ 10억원 미만: 1%
        calculatedReferralAmount = calculatedNetRevenue * 0.01
      } else {
        // 10억원 이상: 1천만원
        calculatedReferralAmount = 10000000
      }
    }

    setReferralAmount(calculatedReferralAmount)
  }, [totalAmount, thirdPartyTotal, useCustomRate])

  // 수혜자 추가
  const addBeneficiary = () => {
    // 새 수혜자 추가 시 기존 수혜자들의 지분 비율 조정
    const newSharePercentage = beneficiaries.length > 0 ? Math.floor(100 / (beneficiaries.length + 1)) : 100
    const remainingPercentage = 100 - newSharePercentage

    // 기존 수혜자들의 지분 비율 재조정
    const updatedBeneficiaries = beneficiaries.map((b, index) => {
      if (beneficiaries.length === 1) {
        // 첫 번째 수혜자가 있는 경우, 지분을 50%로 설정
        return { ...b, sharePercentage: newSharePercentage }
      } else {
        // 여러 명의 수혜자가 있는 경우, 균등하게 분배
        const adjustedShare = Math.floor(remainingPercentage / beneficiaries.length)
        return { ...b, sharePercentage: adjustedShare }
      }
    })

    // 새 수혜자 추가
    setBeneficiaries([
      ...updatedBeneficiaries,
      { id: `beneficiary-${Date.now()}`, name: "", email: "", sharePercentage: newSharePercentage },
    ])
  }

  // 수혜자 제거
  const removeBeneficiary = (id: string) => {
    if (beneficiaries.length <= 1) {
      toast({
        title: "수혜자 제거 불가",
        description: "최소 한 명의 수혜자가 필요합니다.",
        variant: "destructive",
      })
      return
    }

    // 제거할 수혜자의 지분 비율
    const removedBeneficiary = beneficiaries.find((b) => b.id === id)
    const removedShare = removedBeneficiary ? removedBeneficiary.sharePercentage : 0

    // 남은 수혜자들
    const remainingBeneficiaries = beneficiaries.filter((b) => b.id !== id)

    // 남은 수혜자들에게 제거된 지분 재분배
    const updatedBeneficiaries = remainingBeneficiaries.map((b) => {
      const newShare = b.sharePercentage + Math.floor(removedShare / remainingBeneficiaries.length)
      return { ...b, sharePercentage: newShare }
    })

    // 반올림 오차로 인한 합계 조정
    const totalShare = updatedBeneficiaries.reduce((sum, b) => sum + b.sharePercentage, 0)
    if (totalShare !== 100 && updatedBeneficiaries.length > 0) {
      const diff = 100 - totalShare
      updatedBeneficiaries[0].sharePercentage += diff
    }

    setBeneficiaries(updatedBeneficiaries)
  }

  // 수혜자 정보 업데이트
  const updateBeneficiary = (id: string, field: keyof Beneficiary, value: string | number) => {
    setBeneficiaries((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  // 지분 비율 조정 시 합계가 100%가 되도록 조정
  const adjustSharePercentages = (id: string, newValue: number) => {
    // 변경하려는 수혜자의 현재 지분
    const currentBeneficiary = beneficiaries.find((b) => b.id === id)
    if (!currentBeneficiary) return

    const currentShare = currentBeneficiary.sharePercentage
    const diff = newValue - currentShare

    // 다른 수혜자들
    const otherBeneficiaries = beneficiaries.filter((b) => b.id !== id)

    // 다른 수혜자들의 총 지분
    const totalOtherShare = otherBeneficiaries.reduce((sum, b) => sum + b.sharePercentage, 0)

    if (totalOtherShare === 0 || otherBeneficiaries.length === 0) {
      // 다른 수혜자가 없거나 지분이 없는 경우, 현재 수혜자의 지분을 100%로 설정
      setBeneficiaries([{ ...currentBeneficiary, sharePercentage: 100 }])
      return
    }

    if (newValue > 100) {
      // 100%를 초과하는 경우 100%로 제한
      toast({
        title: "지분 비율 초과",
        description: "지분 비율은 100%를 초과할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (newValue < 1) {
      // 1% 미만인 경우 1%로 제한
      toast({
        title: "지분 비율 미달",
        description: "지분 비율은 최소 1% 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    // 다른 수혜자들의 지분 비율 조정
    const updatedBeneficiaries = [
      { ...currentBeneficiary, sharePercentage: newValue },
      ...otherBeneficiaries.map((b) => {
        // 비율에 따라 지분 감소
        const ratio = b.sharePercentage / totalOtherShare
        const adjustment = Math.floor(-diff * ratio)
        const newShare = Math.max(1, b.sharePercentage + adjustment) // 최소 1%
        return { ...b, sharePercentage: newShare }
      }),
    ]

    // 합계가 100%가 되도록 조정
    const totalShare = updatedBeneficiaries.reduce((sum, b) => sum + b.sharePercentage, 0)
    if (totalShare !== 100 && updatedBeneficiaries.length > 1) {
      // 첫 번째 수혜자가 아닌 다른 수혜자에게 차이를 분배
      const otherBeneficiariesInUpdated = updatedBeneficiaries.filter((b) => b.id !== id)
      if (otherBeneficiariesInUpdated.length > 0) {
        const diff = 100 - totalShare
        // 가장 지분이 큰 수혜자에게 차이를 더함
        const maxShareBeneficiary = otherBeneficiariesInUpdated.reduce(
          (max, b) => (b.sharePercentage > max.sharePercentage ? b : max),
          otherBeneficiariesInUpdated[0],
        )

        updatedBeneficiaries.forEach((b) => {
          if (b.id === maxShareBeneficiary.id) {
            b.sharePercentage += diff
          }
        })
      }
    }

    setBeneficiaries(updatedBeneficiaries)
  }

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

    // 신규 고객사일 경우 사업자등록번호와 주소 검증
    if (newCustomerData && (!businessNumber || !address)) {
      toast({
        title: "신규 고객사 정보 누락",
        description: "사업자등록번호와 주소는 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    // 수혜자 정보 검증
    if (beneficiaries.some((b) => !b.name || !b.email)) {
      toast({
        title: "수혜자 정보 누락",
        description: "모든 수혜자의 이름과 이메일을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 수혜자 지분 합계 검증
    const totalSharePercentage = beneficiaries.reduce((sum, b) => sum + b.sharePercentage, 0)
    if (totalSharePercentage !== 100) {
      toast({
        title: "수혜자 지분 비율 오류",
        description: "수혜자 지분 비율의 합계는 100%여야 합니다.",
        variant: "destructive",
      })
      return
    }

    // 필수 서류 검증
    if (!hasContract || !hasBusinessRegistration) {
      toast({
        title: "필수 서류 누락",
        description: "날인된 용역계약서, 사업자등록증은 필수 서류입니다.",
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
      title: "Plus One 제출 완료",
      description: `Invoice No. ${uniqueInvoiceNumber}가 성공적으로 제출되었습니다. 승인 절차가 시작됩니다.`,
    })

    // 고객 정보 준비
    const customerInfo = newCustomerData
      ? {
          id: newCustomerData.id,
          name: newCustomerData.name,
          businessNumber,
          address,
          contactName,
          contactEmail,
          contactPhone,
          isNew: true,
        }
      : {
          ...selectedCustomerInfo,
          isNew: false,
        }

    // 인보이스 정보를 로컬 스토리지에 저장
    const invoiceData = {
      invoiceNumber: uniqueInvoiceNumber,
      customerInfo,
      projectName,
      projectDescription,
      totalAmount: Number(totalAmount),
      currency, // 통화 정보 추가
      thirdPartyVendor: hasThirdPartyVendor,
      thirdPartyVendors: thirdPartyVendors,
      hasCOSS: hasCOSS,
      cossVendors: cossVendors,
      hasReferralFee: hasReferralFee,
      referralFees: referralFees,
      hasDFC: hasDFC,
      dfcVendors: dfcVendors,
      beneficiaries: beneficiaries,
      isCompetitiveWin,
      referralAmount,
      referralNotes,
      approvers: approvers,
      status: "pending",
      currentApprovalStep: 1,
      createdBy: user?.email,
      createdAt: new Date().toISOString(),
      type: "plusone",
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

  // Net Revenue 계산 (3rd party 비용 제외)
  const calculateNetRevenue = () => {
    const grossAmount = Number(totalAmount) || 0
    return Math.max(0, grossAmount - thirdPartyTotal)
  }

  // Plus One 금액 설명 텍스트 생성
  const getPlusOneAmountDescription = () => {
    const netRevenue = calculateNetRevenue()

    if (netRevenue < 10000000) {
      return "1천만원 미만: 지급 제외"
    } else if (netRevenue < 50000000) {
      return "1천만원 이상 ~ 5천만원 미만: 50만원"
    } else if (netRevenue < 1000000000) {
      return "5천만원 이상 ~ 10억원 미만: Net Revenue의 1%"
    } else {
      return "10억원 이상: 1천만원"
    }
  }

  // 수혜자별 보상금 계산
  const calculateBeneficiaryAmount = (sharePercentage: number) => {
    return (referralAmount * sharePercentage) / 100
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-[#1a1144] text-white p-6 rounded-md">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">Plus One</h1>
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
                      options={vendors.map((v) => v.name)}
                      value={customerName}
                      onChange={(value) => {
                        setCustomerName(value)

                        // Check if this is an existing customer
                        const vendor = vendors.find((v) => v.name === value)
                        if (vendor) {
                          handleExistingCustomer(vendor.id)
                        } else if (value) {
                          // Handle as new customer
                          handleNewCustomer(value)
                        } else {
                          // Handle empty selection
                          handleNewCustomer("")
                        }
                      }}
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

                {/* 신규 고객사인 경우 추가 정보 입력 필드 표시 */}
                {newCustomerData && (
                  <div className="space-y-4 p-4 border rounded-md bg-blue-50">
                    <div className="flex items-center text-blue-700 mb-2">
                      <Info className="h-4 w-4 mr-2" />
                      <span className="font-medium">신규 고객사 정보를 입력해주세요.</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="businessNumber" className="font-medium">
                          사업자등록번호 *
                        </Label>
                        <Input
                          id="businessNumber"
                          value={businessNumber}
                          onChange={(e) => setBusinessNumber(e.target.value)}
                          placeholder="000-00-00000 형식으로 입력"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactName" className="font-medium">
                          담당자명
                        </Label>
                        <Input
                          id="contactName"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="담당자 이름을 입력하세요"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="font-medium">
                          담당자 이메일
                        </Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="담당자 이메일을 입력하세요"
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
                          placeholder="000-0000-0000 형식으로 입력"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="font-medium">
                        주소 *
                      </Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="고객사 주소를 입력하세요"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 기존 고객사인 경우 정보 표시 */}
                {selectedCustomerInfo && (
                  <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                    <div className="flex items-center text-gray-700 mb-2">
                      <Info className="h-4 w-4 mr-2" />
                      <span className="font-medium">기존 고객사 정보</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-500">사업자등록번호</span>
                        <div className="p-2 bg-white border rounded-md text-gray-700">
                          {selectedCustomerInfo.businessNumber}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-500">담당자명</span>
                        <div className="p-2 bg-white border rounded-md text-gray-700">
                          {selectedCustomerInfo.contactName || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-500">담당자 이메일</span>
                        <div className="p-2 bg-white border rounded-md text-gray-700">
                          {selectedCustomerInfo.contactEmail || "-"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-500">담당자 연락처</span>
                        <div className="p-2 bg-white border rounded-md text-gray-700">
                          {selectedCustomerInfo.contactPhone || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-500">주소</span>
                      <div className="p-2 bg-white border rounded-md text-gray-700">
                        {selectedCustomerInfo.address || "-"}
                      </div>
                    </div>
                  </div>
                )}

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
                    {selectedCustomerInfo?.contactEmail && customerEmailList.length === 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        * 고객사 담당자 이메일이 자동으로 입력되었습니다. 필요시 수정하세요.
                      </div>
                    )}
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
                <FileUpload
                  label="기타 서류 첨부(계약 관련 자료)"
                  id="otherDocuments"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onUpload={() => {}}
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
                          총 3rd party Vendor 금액: {formatCurrency(thirdPartyTotal, currency)}
                        </div>
                        {(currency === "KRW" || currency === "USD") && (
                          <div className="text-xs text-muted-foreground">
                            {getSecondaryCurrencyDisplay(thirdPartyTotal, currency)}
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

          {/* COSS, Referral Fee, DFC 정보 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                COSS, Referral Fee 및 DFC
                {sectionStatus.coss && sectionStatus.referralFee && sectionStatus.dfc && (
                  <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="coss" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="coss">COSS</TabsTrigger>
                  <TabsTrigger value="referral">Referral Fee</TabsTrigger>
                  <TabsTrigger value="dfc">DFC</TabsTrigger>
                </TabsList>

                {/* COSS 탭 */}
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
                              총 COSS 금액: {formatCurrency(cossTotal, currency)}
                            </div>
                            {(currency === "KRW" || currency === "USD") && (
                              <div className="text-xs text-muted-foreground">
                                {getSecondaryCurrencyDisplay(cossTotal, currency)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Referral Fee 탭 */}
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
                              총 Referral Fee 금액: {formatCurrency(referralFeeTotal, currency)}
                            </div>
                            {(currency === "KRW" || currency === "USD") && (
                              <div className="text-xs text-muted-foreground">
                                {getSecondaryCurrencyDisplay(referralFeeTotal, currency)}
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

                {/* DFC 탭 */}
                <TabsContent value="dfc">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasDFC"
                        checked={hasDFC}
                        onCheckedChange={(checked) => setHasDFC(checked as boolean)}
                      />
                      <Label htmlFor="hasDFC" className="font-medium">
                        DFC 있음
                      </Label>
                    </div>

                    {hasDFC && (
                      <div className="mt-4 border rounded-md p-4">
                        <VendorSelection
                          vendors={dfcVendors}
                          onChange={setDFCVendors}
                          title="DFC"
                          nameLabel="Company"
                          amountLabel={`금액 (${currency})`}
                          currency={currency}
                        />

                        {dfcVendors.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium">총 DFC 금액: {formatCurrency(dfcTotal, currency)}</div>
                            {(currency === "KRW" || currency === "USD") && (
                              <div className="text-xs text-muted-foreground">
                                {getSecondaryCurrencyDisplay(dfcTotal, currency)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Plus One 정보 */}
          <Card className="border-[#1a1144] border-t-4 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gray-50">
              <CardTitle className="text-xl text-[#1a1144]">
                Plus One 정보
                {sectionStatus.plusOneInfo && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />}
              </CardTitle>
              <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    정책 보기
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Plus One 정책 안내</DialogTitle>
                    <DialogDescription>Plus One Referral Award 정책</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="p-4 bg-blue-50 rounded-md">
                      <h3 className="font-medium mb-2">기본 산정 기준</h3>
                      <p>매출 총액(Gross Revenue)에서 외부 3rd Party 비용 차감 후 Net Revenue 기준으로 계산됩니다.</p>
                    </div>

                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Plus One Referral Award 정책</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Revenue (KRW)
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                PlusOne Referral Award (KRW)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            <tr>
                              <td className="px-3 py-2">1천만원 미만</td>
                              <td className="px-3 py-2">지급 제외</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">1천만원 이상 ~ 5천만원 미만</td>
                              <td className="px-3 py-2">50만원</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">5천만원 이상 ~ 10억원 미만</td>
                              <td className="px-3 py-2">1% of Net Revenue</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">10억원 이상</td>
                              <td className="px-3 py-2">1천만원</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-md">
                      <h3 className="font-medium mb-2">참고 사항</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Net Revenue는 총 수수료에서 3rd party 비용을 제외한 금액입니다.</li>
                        <li>여러 명의 수혜자가 있는 경우 지분 비율에 따라 보상금이 분배됩니다.</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* 1. 보상금 (정책에 따라 자동 계산) */}
                <div className="space-y-2">
                  <Label htmlFor="referralAmount" className="font-medium">
                    보상금 (정책 기준)
                  </Label>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <div className="font-medium">
                      {formatCurrency(referralAmount, currency)}
                      {(currency === "KRW" || currency === "USD") && (
                        <span className="text-sm ml-1 text-muted-foreground">
                          {getSecondaryCurrencyDisplay(referralAmount, currency)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {getPlusOneAmountDescription()}
                      {hasThirdPartyVendor && thirdPartyTotal > 0 && (
                        <span> (3rd party 비용 {formatCurrency(thirdPartyTotal, currency)} 제외)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. 경쟁 수주 여부 */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCompetitiveWin"
                    checked={isCompetitiveWin}
                    onCheckedChange={(checked) => setIsCompetitiveWin(checked as boolean)}
                  />
                  <Label htmlFor="isCompetitiveWin" className="font-medium">
                    경쟁 수주입니다
                  </Label>
                </div>

                {/* 3. 수혜자 정보 (다수 지원) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">수혜자 정보</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBeneficiary}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      수혜자 추가
                    </Button>
                  </div>

                  {beneficiaries.map((beneficiary, index) => (
                    <div key={beneficiary.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">수혜자 {index + 1}</h4>
                        {beneficiaries.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBeneficiary(beneficiary.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            삭제
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`beneficiary-name-${beneficiary.id}`} className="font-medium">
                            수혜자 이름 *
                          </Label>
                          <Input
                            id={`beneficiary-name-${beneficiary.id}`}
                            value={beneficiary.name}
                            onChange={(e) => updateBeneficiary(beneficiary.id, "name", e.target.value)}
                            placeholder="수혜자 이름을 입력하세요"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`beneficiary-email-${beneficiary.id}`} className="font-medium">
                            수혜자 이메일 *
                          </Label>
                          <Input
                            id={`beneficiary-email-${beneficiary.id}`}
                            type="email"
                            value={beneficiary.email}
                            onChange={(e) => updateBeneficiary(beneficiary.id, "email", e.target.value)}
                            placeholder="수혜자 이메일을 입력하세요"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`beneficiary-share-${beneficiary.id}`} className="font-medium">
                            지분 비율 (%) *
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id={`beneficiary-share-${beneficiary.id}`}
                              type="number"
                              value={beneficiary.sharePercentage}
                              onChange={(e) => adjustSharePercentages(beneficiary.id, Number(e.target.value))}
                              min="1"
                              max="100"
                              step="1"
                              className="w-24"
                              required
                            />
                            <span>%</span>
                          </div>
                        </div>
                      </div>

                      {/* 수혜자별 보상금 표시 */}
                      <div className="mt-3 p-2 bg-gray-50 rounded-md">
                        <div className="text-sm">
                          <span className="font-medium">보상금: </span>
                          {formatCurrency(calculateBeneficiaryAmount(beneficiary.sharePercentage), currency)}
                          {(currency === "KRW" || currency === "USD") && (
                            <span className="text-xs ml-1 text-muted-foreground">
                              {getSecondaryCurrencyDisplay(
                                calculateBeneficiaryAmount(beneficiary.sharePercentage),
                                currency,
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 지분 비율 합계 표시 */}
                  <div className="text-sm text-right">
                    <span className="font-medium">지분 비율 합계: </span>
                    <span
                      className={
                        beneficiaries.reduce((sum, b) => sum + b.sharePercentage, 0) === 100
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {beneficiaries.reduce((sum, b) => sum + b.sharePercentage, 0)}%
                    </span>
                    {beneficiaries.reduce((sum, b) => sum + b.sharePercentage, 0) !== 100 && (
                      <span className="text-red-600 ml-2">(합계가 100%가 되어야 합니다)</span>
                    )}
                  </div>
                </div>

                {/* 4. 추가 설명 */}
                <div className="space-y-2">
                  <Label htmlFor="referralNotes" className="font-medium">
                    추가 설명
                  </Label>
                  <Textarea
                    id="referralNotes"
                    value={referralNotes}
                    onChange={(e) => setReferralNotes(e.target.value)}
                    placeholder="Plus One에 대한 추가 설명이나 특이사항을 입력하세요"
                    rows={3}
                  />
                </div>
              </div>
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
                totalAmount={totalAmount ? Number(totalAmount) : 0}
                hasThirdPartyVendor={hasThirdPartyVendor}
                thirdPartyAmount={thirdPartyTotal}
                hasCOSS={hasCOSS}
                cossAmount={cossTotal}
                hasReferralFee={hasReferralFee}
                referralFeeAmount={referralFeeTotal}
                hasDFC={hasDFC}
                dfcAmount={dfcTotal}
                plusOneAmount={0} // Plus One 금액을 차감하지 않도록 0으로 설정
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
              Plus One 제출
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
