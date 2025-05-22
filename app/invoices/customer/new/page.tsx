"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { ApproverSelection } from "@/components/approver-selection"
import { CompanySelect } from "@/components/company-select"
import { CompanyInformation } from "@/components/company-information"
import type { Company } from "@/lib/company-data"
import { formatCurrency } from "@/lib/currency"
import { Check, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  customerName: z.string().min(1, { message: "고객사명을 선택해주세요" }),
  projectName: z.string().min(1, { message: "프로젝트명을 입력해주세요" }),
  projectDescription: z.string().optional(),
  feeForecasted: z.boolean().default(false),
  invoiceDate: z.string().min(1, { message: "인보이스 날짜를 선택해주세요" }),
  dueDate: z.string().min(1, { message: "지급 기한을 선택해주세요" }),
  currency: z.string().min(1, { message: "통화를 선택해주세요" }),
  amount: z.string().min(1, { message: "금액을 입력해주세요" }),
  vatIncluded: z.boolean().default(false),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.any()).optional(),
  additionalDocuments: z.array(z.any()).optional(),
  approvers: z.array(z.string()).default([]),
  // 3rd party Vendor fields
  includeThirdPartyVendor: z.boolean().default(false),
  thirdPartyVendorName: z.string().optional(),
  thirdPartyVendorAmount: z.string().optional(),
  // COSS fields
  includeCOSS: z.boolean().default(false),
  cossVendorName: z.string().optional(),
  cossAmount: z.string().optional(),
  // DFC fields
  includeDFC: z.boolean().default(false),
  dfcVendorName: z.string().optional(),
  dfcAmount: z.string().optional(),
  // Referral Fee fields
  includeReferralFee: z.boolean().default(false),
  referralFeeBranch: z.string().optional(),
  referralFeeAmount: z.string().optional(),
  // Transaction fields
  transactionType: z.string().optional(),
  propertyType: z.string().optional(),
  squareFeet: z.string().optional(),
  leaseTerm: z.string().optional(),
  price: z.string().optional(),
  // Fee calculation
  feeCalculation: z.string().optional(),
  // Contact emails
  contactEmail: z.string().optional(),
  companyEmail: z.string().optional(),
  // Net Fee Sharing
  feeShareEmail: z.string().optional(),
  feeShareAmount: z.string().optional(),
  feeSharePercentage: z.string().optional(),
  feeShareTeam: z.string().optional(),
  // Refund
  refundClause: z.boolean().default(false),
})

export default function CustomerInvoicePage() {
  const router = useRouter()
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [newCompanies, setNewCompanies] = useState<Company[]>([])
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [activeTab, setActiveTab] = useState("coss")
  const [completedSections, setCompletedSections] = useState({
    customerInfo: false,
    invoiceDetails: false,
    plusOne: false,
    coss: false,
    dfc: false,
    referralFee: false,
    approvers: false,
    transaction: false,
  })

  // Generate invoice number on component mount
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const randomNum = Math.floor(100 + Math.random() * 900)
    setInvoiceNumber(`CI-${year}${month}${day}-${randomNum}`)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      projectName: "",
      projectDescription: "",
      feeForecasted: false,
      invoiceDate: "",
      dueDate: "",
      currency: "KRW",
      amount: "",
      vatIncluded: false,
      paymentTerms: "",
      notes: "",
      attachments: [],
      additionalDocuments: [],
      approvers: [],
      includeThirdPartyVendor: false,
      thirdPartyVendorName: "",
      thirdPartyVendorAmount: "",
      includeCOSS: false,
      cossVendorName: "",
      cossAmount: "",
      includeDFC: false,
      dfcVendorName: "",
      dfcAmount: "",
      includeReferralFee: false,
      referralFeeBranch: "",
      referralFeeAmount: "",
      transactionType: "",
      propertyType: "",
      squareFeet: "",
      leaseTerm: "",
      price: "",
      feeCalculation: "",
      contactEmail: "",
      companyEmail: "",
      feeShareEmail: "",
      feeShareAmount: "",
      feeSharePercentage: "",
      feeShareTeam: "",
      refundClause: false,
    },
  })

  // Watch form values to update completion status
  const watchCustomerName = form.watch("customerName")
  const watchProjectName = form.watch("projectName")
  const watchInvoiceDate = form.watch("invoiceDate")
  const watchDueDate = form.watch("dueDate")
  const watchAmount = form.watch("amount")
  const watchAttachments = form.watch("attachments")
  const watchApprovers = form.watch("approvers")
  const watchIncludeThirdPartyVendor = form.watch("includeThirdPartyVendor")
  const watchIncludeCOSS = form.watch("includeCOSS")
  const watchIncludeDFC = form.watch("includeDFC")
  const watchIncludeReferralFee = form.watch("includeReferralFee")

  // Handle mutual exclusivity between 3rd party Vendor and COSS
  useEffect(() => {
    if (watchIncludeThirdPartyVendor && watchIncludeCOSS) {
      form.setValue("includeCOSS", false)
    }
  }, [watchIncludeThirdPartyVendor, form])

  useEffect(() => {
    if (watchIncludeCOSS && watchIncludeThirdPartyVendor) {
      form.setValue("includeThirdPartyVendor", false)
    }
  }, [watchIncludeCOSS, form])

  // Redirect to 3rd party Invoice entry screen when 3rd party Vendor is selected
  useEffect(() => {
    if (watchIncludeThirdPartyVendor) {
      // For demonstration purposes, show an alert
      alert("3rd party Vendor가 선택되었습니다. 3rd party Invoice 입력 화면으로 이동합니다.")

      // In a real application, you would redirect to the 3rd party Invoice entry screen
      // router.push('/invoices/third-party/new')
    }
  }, [watchIncludeThirdPartyVendor])

  // Update completion status when form values change
  useEffect(() => {
    setCompletedSections((prev) => ({
      ...prev,
      customerInfo: !!watchCustomerName && !!watchProjectName,
      invoiceDetails: !!watchInvoiceDate && !!watchDueDate && !!watchAmount && watchAttachments.length > 0,
      coss: !watchIncludeCOSS || (watchIncludeCOSS && !!form.watch("cossVendorName") && !!form.watch("cossAmount")),
      dfc: !watchIncludeDFC || (watchIncludeDFC && !!form.watch("dfcVendorName") && !!form.watch("dfcAmount")),
      referralFee:
        !watchIncludeReferralFee ||
        (watchIncludeReferralFee && !!form.watch("referralFeeBranch") && !!form.watch("referralFeeAmount")),
      approvers: watchApprovers.length > 0,
      transaction: true, // Optional section
    }))
  }, [
    watchCustomerName,
    watchProjectName,
    watchInvoiceDate,
    watchDueDate,
    watchAmount,
    watchAttachments,
    watchApprovers,
    watchIncludeThirdPartyVendor,
    watchIncludeCOSS,
    watchIncludeDFC,
    watchIncludeReferralFee,
    form,
  ])

  // Calculate progress percentage
  const calculateProgress = () => {
    const sections = Object.values(completedSections)
    const completedCount = sections.filter(Boolean).length
    return Math.round((completedCount / sections.length) * 100)
  }

  const handleCompanyChange = (_value: string, company: Company | null) => {
    setSelectedCompany(company)
    form.setValue("customerName", company?.name || "")
  }

  const handleSaveNewCompany = (company: Company) => {
    // In a real application, you would save this to your database
    const newCompany = {
      ...company,
      type: "customer" as const,
    }
    setNewCompanies((prev) => [...prev, newCompany])
    setSelectedCompany(newCompany)
    form.setValue("customerName", newCompany.name)
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real application, you would submit this data to your API
    console.log(values)
    alert("인보이스가 제출되었습니다.")
  }

  // Calculate total amount
  const amount = Number.parseFloat(form.watch("amount") || "0")
  const cossAmount = Number.parseFloat(form.watch("cossAmount") || "0")
  const dfcAmount = Number.parseFloat(form.watch("dfcAmount") || "0")
  const referralFeeAmount = Number.parseFloat(form.watch("referralFeeAmount") || "0")

  const includeCOSS = form.watch("includeCOSS")
  const includeDFC = form.watch("includeDFC")
  const includeReferralFee = form.watch("includeReferralFee")

  const totalAmount =
    amount +
    (includeCOSS ? cossAmount : 0) +
    (includeDFC ? dfcAmount : 0) -
    (includeReferralFee ? referralFeeAmount : 0)

  const currency = form.watch("currency")
  const formattedTotalAmount = formatCurrency(totalAmount, currency)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 바 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 py-3 px-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <Link href="/dashboard" className="flex items-center mr-4">
              <img src="/images/CW_Logo_Color.png" alt="Cushman & Wakefield Logo" className="h-8 w-auto" />
            </Link>

            <nav className="flex items-center space-x-4 lg:space-x-6">
              <Link
                href="/dashboard"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                Main
              </Link>
              <div className="relative group">
                <div className="flex items-center text-sm font-medium transition-colors hover:text-primary text-primary">
                  Invoice Request
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1 h-4 w-4"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div className="absolute hidden group-hover:block bg-white border border-gray-200 rounded-md shadow-lg p-2 min-w-[200px] z-50">
                  <Link
                    href="/invoices/customer/new"
                    className="block px-4 py-2 text-sm text-primary hover:bg-gray-100 rounded-md"
                  >
                    Customer Invoice
                  </Link>
                  <Link
                    href="/invoices/supplier/new"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-gray-100 rounded-md"
                  >
                    Supplier Invoice
                  </Link>
                </div>
              </div>
              <Link
                href="/soc"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                SOC
              </Link>
              <Link
                href="/vendors/search"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                Search Vendors
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/inbox"
              className="flex items-center text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              Inbox
            </Link>
            <Button variant="ghost" size="sm">
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-10">
        <div className="container mx-auto px-4">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-[#1a1144] text-white p-6 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Customer Invoice</h1>
                  <div className="mt-2 w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
                  </div>
                  <div className="text-sm mt-1">작성 진행률: {calculateProgress()}%</div>
                </div>
                <div className="bg-white text-[#1a1144] p-3 rounded-md">
                  <span className="text-sm font-medium mr-2">Invoice No.</span>
                  <span className="font-mono font-bold">{invoiceNumber}</span>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">
                        고객 정보
                        {completedSections.customerInfo && (
                          <Check className="inline-block ml-2 h-5 w-5 text-green-500" />
                        )}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>고객사명 *</FormLabel>
                            <FormControl>
                              <CompanySelect type="customer" value={field.value} onChange={handleCompanyChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>프로젝트명 *</FormLabel>
                            <FormControl>
                              <Input placeholder="프로젝트명을 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <CompanyInformation
                      selectedCompany={selectedCompany}
                      onSaveNewCompany={handleSaveNewCompany}
                      type="customer"
                    />

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="projectDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>프로젝트 설명</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="프로젝트에 대한 설명을 입력하세요"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="feeForecasted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Fee Forecast 반영 여부</FormLabel>
                              <FormDescription>
                                이 인보이스가 Fee Forecast에 반영되었는지 여부를 체크합니다.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Details */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">
                        인보이스 상세 정보
                        {completedSections.invoiceDetails && (
                          <Check className="inline-block ml-2 h-5 w-5 text-green-500" />
                        )}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>담당자 이메일 (복수 기재 가능) *</FormLabel>
                            <FormControl>
                              <Input placeholder="담당자 이메일 입력" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>고객사 이메일 (복수 기재 가능) *</FormLabel>
                            <FormControl>
                              <Input placeholder="고객사 이메일 입력" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="invoiceDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>세금계산서 발행일 *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>고객사 요청일 *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>통화 *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="통화를 선택하세요" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="KRW">KRW (₩)</SelectItem>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="JPY">JPY (¥)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>금액 *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vatIncluded"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-8">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>VAT 포함</FormLabel>
                              <FormDescription>금액에 VAT가 포함되어 있는지 여부</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* File Attachments */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">필수 서류</h2>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="attachments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>납입된 용역계약서 (PDF) *</FormLabel>
                            <FormControl>
                              <FileUpload
                                value={field.value}
                                onChange={field.onChange}
                                accept=".pdf"
                                multiple={false}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalDocuments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>사업자등록증 (PDF 또는 이미지) *</FormLabel>
                            <FormControl>
                              <FileUpload
                                value={field.value}
                                onChange={field.onChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple={false}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalDocuments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>승인 메일 (PDF) *</FormLabel>
                            <FormControl>
                              <FileUpload
                                value={field.value}
                                onChange={field.onChange}
                                accept=".pdf"
                                multiple={false}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="refundClause"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Refund 조항</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalDocuments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>입대체 계약서 (선택사항)</FormLabel>
                            <FormControl>
                              <FileUpload
                                value={field.value}
                                onChange={field.onChange}
                                accept=".pdf,.doc,.docx"
                                multiple={false}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 3rd party Vendor */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">
                        3rd party Vendor 정보
                        {completedSections.invoiceDetails && (
                          <Check className="inline-block ml-2 h-5 w-5 text-green-500" />
                        )}
                      </h2>
                    </div>

                    <FormField
                      control={form.control}
                      name="includeThirdPartyVendor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={watchIncludeCOSS} // Disable if COSS is selected
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>3rd party Vendor 있음</FormLabel>
                            <FormDescription>
                              3rd party Vendor를 선택하면 별도의 입력 화면으로 이동합니다. (COSS와 동시에 선택할 수
                              없습니다)
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {watchIncludeThirdPartyVendor && (
                      <div className="mt-4 space-y-4">
                        <FormField
                          control={form.control}
                          name="thirdPartyVendorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor 이름 *</FormLabel>
                              <FormControl>
                                <Input placeholder="Vendor 이름 입력" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="thirdPartyVendorAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>금액 *</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* COSS, DFC & Referral Fee */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">
                        COSS, DFC 및 Referral Fee
                        {completedSections.coss && completedSections.dfc && completedSections.referralFee && (
                          <Check className="inline-block ml-2 h-5 w-5 text-green-500" />
                        )}
                      </h2>
                    </div>

                    <Tabs defaultValue="coss" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="coss">COSS</TabsTrigger>
                        <TabsTrigger value="dfc">DFC</TabsTrigger>
                        <TabsTrigger value="referral">Referral Fee</TabsTrigger>
                      </TabsList>

                      <TabsContent value="coss">
                        <FormField
                          control={form.control}
                          name="includeCOSS"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={watchIncludeThirdPartyVendor} // Disable if 3rd party Vendor is selected
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>COSS 있음</FormLabel>
                                <FormDescription>
                                  COSS를 선택하면 금액이 총액에 추가됩니다. (3rd party Vendor와 동시에 선택할 수
                                  없습니다)
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {watchIncludeCOSS && (
                          <div className="mt-4 space-y-4">
                            <FormField
                              control={form.control}
                              name="cossVendorName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vendor 이름 *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Vendor 이름 입력" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="cossAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>COSS 금액 *</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                  </FormControl>
                                  <FormDescription>COSS 금액은 총 금액에 추가됩니다.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="dfc">
                        <FormField
                          control={form.control}
                          name="includeDFC"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>DFC 있음</FormLabel>
                                <FormDescription>DFC를 선택하면 금액이 총액에 추가됩니다.</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {watchIncludeDFC && (
                          <div className="mt-4 space-y-4">
                            <FormField
                              control={form.control}
                              name="dfcVendorName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vendor 이름 *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Vendor 이름 입력" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="dfcAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>DFC 금액 *</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                  </FormControl>
                                  <FormDescription>DFC 금액은 총 금액에 추가됩니다.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="referral">
                        <FormField
                          control={form.control}
                          name="includeReferralFee"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Referral Fee 있음</FormLabel>
                                <FormDescription>Referral Fee를 선택하면 금액이 총액에서 차감됩니다.</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {watchIncludeReferralFee && (
                          <div className="mt-4 space-y-4">
                            <FormField
                              control={form.control}
                              name="referralFeeBranch"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>지점 *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="지점을 선택하세요" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="seoul">서울</SelectItem>
                                      <SelectItem value="busan">부산</SelectItem>
                                      <SelectItem value="incheon">인천</SelectItem>
                                      <SelectItem value="daegu">대구</SelectItem>
                                      <SelectItem value="daejeon">대전</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="referralFeeAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Referral Fee 금액 *</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                  </FormControl>
                                  <FormDescription>Referral Fee 금액은 총 금액에서 차감됩니다.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* Fee Summary */}
                    {(watchIncludeCOSS || watchIncludeDFC || watchIncludeReferralFee) && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <h3 className="font-medium mb-2">수수료 계산 요약</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>기본 금액:</span>
                            <span>{formatCurrency(amount, currency)}</span>
                          </div>
                          {watchIncludeCOSS && (
                            <div className="flex justify-between">
                              <span>COSS 금액 (추가):</span>
                              <span className="text-green-600">+{formatCurrency(cossAmount, currency)}</span>
                            </div>
                          )}
                          {watchIncludeDFC && (
                            <div className="flex justify-between">
                              <span>DFC 금액 (추가):</span>
                              <span className="text-green-600">+{formatCurrency(dfcAmount, currency)}</span>
                            </div>
                          )}
                          {watchIncludeReferralFee && (
                            <div className="flex justify-between">
                              <span>Referral Fee (차감):</span>
                              <span className="text-red-600">-{formatCurrency(referralFeeAmount, currency)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium pt-2 border-t">
                            <span>최종 금액:</span>
                            <span>{formattedTotalAmount}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Net Fee Sharing */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Net Fee Sharing *</h2>
                      <Button type="button" variant="outline" size="sm" className="bg-[#1a1144] text-white">
                        <Plus className="h-4 w-4 mr-1" /> 팀 추가
                      </Button>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm">Net Fee Sharing</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>총 수수료: {formattedTotalAmount}</span>
                        <span>순 수수료: {formattedTotalAmount}</span>
                      </div>
                    </div>

                    <div className="border rounded-md p-4 mb-2">
                      <div className="grid grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name="feeShareEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>이메일 *</FormLabel>
                              <FormControl>
                                <Input placeholder="이메일 주소" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="feeShareAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>금액 (KRW) *</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="feeSharePercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>비율 (%) *</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="feeShareTeam"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>팀 *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="팀 선택" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="team1">팀 1</SelectItem>
                                  <SelectItem value="team2">팀 2</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>총 비율: 0.00% (100.00% 부족)</span>
                      <span>총 금액: {formatCurrency(0, currency)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Information */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">
                        Transaction 정보 (선택사항)
                        {completedSections.transaction && (
                          <Check className="inline-block ml-2 h-5 w-5 text-green-500" />
                        )}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <FormField
                        control={form.control}
                        name="transactionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transaction Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Transaction Type 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="type1">Type 1</SelectItem>
                                <SelectItem value="type2">Type 2</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Property Type 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="type1">Type 1</SelectItem>
                                <SelectItem value="type2">Type 2</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="squareFeet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sq.Ft (면적)</FormLabel>
                            <FormControl>
                              <Input placeholder="면적 (평방피트)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="leaseTerm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lease Term (임대기간, 개월)</FormLabel>
                            <FormControl>
                              <Input placeholder="임대기간 (개월)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>매매가 (KRW)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Calculation */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">청구 금액 계산 근거</h2>
                    </div>

                    <FormField
                      control={form.control}
                      name="feeCalculation"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="예: 계약서 제5조에 따른 성공보수 산정 - 연간 임대료의 4%"
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>청구하는 금액의 계산 근거를 상세히 기재해주세요.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Approvers */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">
                        승인 워크플로우 *
                        {completedSections.approvers && <Check className="inline-block ml-2 h-5 w-5 text-green-500" />}
                      </h2>
                    </div>

                    <FormField
                      control={form.control}
                      name="approvers"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ApproverSelection
                              approvers={
                                field.value?.map((email) => ({
                                  id: email,
                                  email: email,
                                  level: 1,
                                })) || []
                              }
                              onChange={(newApprovers) => {
                                field.onChange(newApprovers.map((a) => a.email))
                              }}
                              currentUserEmail=""
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-center space-x-4 mt-6">
                  <Button variant="outline" type="button" className="w-24">
                    취소
                  </Button>
                  <Button type="submit" className="w-32 bg-red-500 hover:bg-red-600">
                    인보이스 제출
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
