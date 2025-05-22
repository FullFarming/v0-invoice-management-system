"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { ApproverSelection, type Approver } from "@/components/approver-selection"
import { CompanySelect } from "@/components/company-select"
import { CompanyInformation } from "@/components/company-information"
import type { Company } from "@/lib/company-data"
import { DashboardLayout } from "@/components/dashboard-layout"

const formSchema = z.object({
  supplierName: z.string().min(1, { message: "공급업체명을 선택해주세요" }),
  invoiceNumber: z.string().min(1, { message: "인보이스 번호를 입력해주세요" }),
  projectName: z.string().min(1, { message: "프로젝트명을 입력해주세요" }),
  projectDescription: z.string().optional(),
  invoiceDate: z.string().min(1, { message: "인보이스 날짜를 선택해주세요" }),
  dueDate: z.string().min(1, { message: "지급 기한을 선택해주세요" }),
  currency: z.string().min(1, { message: "통화를 선택해주세요" }),
  amount: z.string().min(1, { message: "금액을 입력해주세요" }),
  vatIncluded: z.boolean().default(false),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.any()).min(1, { message: "인보이스 첨부 파일을 업로드해주세요" }),
  additionalDocuments: z.array(z.any()).optional(),
  approvers: z.array(z.any()).min(1, { message: "최소 한 명의 승인자를 선택해주세요" }),
})

export default function SupplierInvoicePage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [newCompanies, setNewCompanies] = useState<Company[]>([])
  const [approvers, setApprovers] = useState<Approver[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierName: "",
      invoiceNumber: "",
      projectName: "",
      projectDescription: "",
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
    },
  })

  const handleCompanyChange = (_value: string, company: Company | null) => {
    setSelectedCompany(company)
    form.setValue("supplierName", company?.name || "")
  }

  const handleSaveNewCompany = (company: Company) => {
    // In a real application, you would save this to your database
    const newCompany = {
      ...company,
      type: "supplier" as const,
    }
    setNewCompanies((prev) => [...prev, newCompany])
    setSelectedCompany(newCompany)
    form.setValue("supplierName", newCompany.name)
  }

  const handleApproversChange = (newApprovers: Approver[]) => {
    setApprovers(newApprovers)
    // Update the form with approver emails for validation
    form.setValue(
      "approvers",
      newApprovers.map((approver) => approver.email),
    )
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real application, you would submit this data to your API
    console.log(values)
    alert("인보이스가 제출되었습니다.")
  }

  const calculateProgress = () => {
    // This is a placeholder. Implement your progress calculation logic here.
    return 50
  }

  const invoiceNumber = "INV-2024-001" // Example invoice number

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-[#1a1144] text-white p-6 rounded-md">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">Supplier Invoice</h1>
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>공급업체 정보</CardTitle>
                <CardDescription>인보이스 발행을 위한 공급업체 정보를 입력해주세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>공급업체명 *</FormLabel>
                      <FormControl>
                        <CompanySelect type="supplier" value={field.value} onChange={handleCompanyChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CompanyInformation
                  selectedCompany={selectedCompany}
                  onSaveNewCompany={handleSaveNewCompany}
                  type="supplier"
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>인보이스 번호 *</FormLabel>
                      <FormControl>
                        <Input placeholder="인보이스 번호를 입력하세요" {...field} />
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

                <FormField
                  control={form.control}
                  name="projectDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>프로젝트 설명</FormLabel>
                      <FormControl>
                        <Textarea placeholder="프로젝트에 대한 설명을 입력하세요" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>인보이스 상세 정보</CardTitle>
                <CardDescription>인보이스의 상세 정보를 입력해주세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>인보이스 날짜 *</FormLabel>
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
                        <FormLabel>지급 기한 *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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

                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>지급 조건</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 인보이스 수령 후 30일 이내" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비고</FormLabel>
                      <FormControl>
                        <Textarea placeholder="추가 정보나 참고사항을 입력하세요" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>인보이스 첨부 *</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          multiple
                        />
                      </FormControl>
                      <FormDescription>인보이스 문서를 첨부해주세요. (PDF, Word, Excel)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalDocuments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>기타 서류 첨부(계약 관련 자료)</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          multiple
                        />
                      </FormControl>
                      <FormDescription>계약서, 견적서 등 관련 문서를 첨부해주세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>승인자 선택</CardTitle>
                <CardDescription>인보이스 승인을 위한 승인자를 선택해주세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="approvers"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <ApproverSelection approvers={approvers} onChange={handleApproversChange} />
                      </FormControl>
                      <FormDescription>최소 한 명의 승인자를 선택해야 합니다.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button">
                취소
              </Button>
              <Button type="submit">인보이스 제출</Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  )
}
