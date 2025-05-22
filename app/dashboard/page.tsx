"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Download, Eye, DollarSign, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import Link from "next/link"
import { ApprovalStatus, type ApprovalStep } from "@/components/approval-status"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, getSecondaryCurrencyDisplay } from "@/lib/currency"

// 인보이스 타입 정의
interface Invoice {
  invoiceNumber: string
  customerName?: string
  supplierName?: string
  projectName: string
  totalAmount: number
  currency?: string
  status: "pending" | "approved" | "rejected"
  currentApprovalStep: number
  approvers: {
    id: string
    email: string
    level: number
  }[]
  approvalSteps?: ApprovalStep[]
  createdBy: string
  createdAt: string
  type: "customer" | "supplier" | "plusone"
  feeShares?: {
    id: string
    email: string
    amount: number
    percentage: number
    team: string
  }[]
  referrerName?: string
  referrerEmail?: string
  referrerDepartment?: string
  referralAmount?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isOwner } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // URL 파라미터에서 탭 정보 가져오기
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState("customer")

  // 탭 파라미터가 있으면 해당 탭으로 설정
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // 인보이스 데이터 로드
  useEffect(() => {
    // 로컬 스토리지에서 인보이스 데이터 로드
    const loadInvoices = () => {
      const storedInvoices = localStorage.getItem("invoices") || "[]"
      const allInvoices = JSON.parse(storedInvoices) as Invoice[]

      // 현재 사용자가 제출한 인보이스만 필터링
      const userInvoices = allInvoices.filter((invoice) => invoice.createdBy === user?.email)
      setInvoices(userInvoices)

      // 검색어에 따라 필터링
      filterInvoices(userInvoices, searchTerm)
    }

    loadInvoices()

    // 로컬 스토리지 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = () => {
      loadInvoices()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [user?.email])

  // 검색어에 따라 인보이스 필터링
  const filterInvoices = (invoiceList: Invoice[], term: string) => {
    if (!term.trim()) {
      // 검색어가 없으면 사용자의 모든 인보이스 표시
      setFilteredInvoices(invoiceList)
    } else {
      // 검색어에 따라 필터링
      const filtered = invoiceList.filter((invoice) => {
        return (
          invoice.invoiceNumber.toLowerCase().includes(term.toLowerCase()) ||
          invoice.projectName.toLowerCase().includes(term.toLowerCase()) ||
          (invoice.customerName && invoice.customerName.toLowerCase().includes(term.toLowerCase())) ||
          (invoice.supplierName && invoice.supplierName.toLowerCase().includes(term.toLowerCase()))
        )
      })

      setFilteredInvoices(filtered)
    }
  }

  // 검색어 변경 시 필터링
  useEffect(() => {
    filterInvoices(invoices, searchTerm)
  }, [searchTerm, invoices])

  // 인보이스 삭제 함수
  const handleDeleteInvoice = (invoiceNumber: string) => {
    // 로컬 스토리지에서 인보이스 데이터 로드
    const storedInvoices = localStorage.getItem("invoices") || "[]"
    const allInvoices = JSON.parse(storedInvoices) as Invoice[]

    // 해당 인보이스 찾기
    const invoiceToDelete = allInvoices.find((invoice) => invoice.invoiceNumber === invoiceNumber)

    // 자신이 올린 인보이스만 삭제 가능
    if (invoiceToDelete && invoiceToDelete.createdBy === user?.email) {
      // 승인된 인보이스는 삭제 불가
      if (invoiceToDelete.status === "approved") {
        toast({
          title: "삭제 실패",
          description: "승인된 인보이스는 삭제할 수 없습니다.",
          variant: "destructive",
        })
        return
      }

      // 인보이스 삭제
      const updatedInvoices = allInvoices.filter((invoice) => invoice.invoiceNumber !== invoiceNumber)
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices))

      // 상태 업데이트 - 사용자의 인보이스만 필터링
      const userInvoices = updatedInvoices.filter((invoice) => invoice.createdBy === user?.email)
      setInvoices(userInvoices)
      filterInvoices(userInvoices, searchTerm)

      toast({
        title: "인보이스 삭제 완료",
        description: `인보이스 ${invoiceNumber}가 성공적으로 삭제되었습니다.`,
      })
    } else {
      toast({
        title: "삭제 권한 없음",
        description: "자신이 올린 인보이스만 삭제할 수 있습니다.",
        variant: "destructive",
      })
    }
  }

  // 인보이스 상세 정보 보기
  const showInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailsOpen(true)
  }

  // 사용자가 인보이스를 삭제할 수 있는지 확인하는 함수
  const canDeleteInvoice = (createdBy: string, status: string) => {
    return user?.email === createdBy && status !== "approved"
  }

  // 승인 상태에 따른 배지 색상 결정
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // 승인 상태에 따른 텍스트 결정
  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "승인됨"
      case "rejected":
        return "거부됨"
      default:
        return "승인 대기 중"
    }
  }

  // 총 금액 계산 (모든 인보이스의 합)
  const calculateTotalAmount = () => {
    // 모든 금액을 KRW로 환산하여 계산 (실제 구현에서는 환율 API 사용)
    return filteredInvoices.reduce((sum, invoice) => {
      // 통화가 KRW가 아닌 경우 환산 (간단한 예시)
      if (invoice.currency && invoice.currency !== "KRW") {
        if (invoice.currency === "USD") {
          return sum + invoice.totalAmount * 1478.25 // USD to KRW
        }
        // 다른 통화에 대한 환산 로직 추가 가능
        return sum + invoice.totalAmount
      }
      return sum + invoice.totalAmount
    }, 0)
  }

  // USD로 환산된 총 금액 계산
  const calculateTotalAmountInUSD = () => {
    return calculateTotalAmount() / 1478.25
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="인보이스 검색..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/invoices/customer/new">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Customer Invoice
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 인보이스</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredInvoices.length}</div>
              <p className="text-xs text-muted-foreground">
                Customer: {filteredInvoices.filter((inv) => inv.type === "customer").length}, Supplier:{" "}
                {filteredInvoices.filter((inv) => inv.type === "supplier").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인된 인보이스</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredInvoices.filter((invoice) => invoice.status === "approved").length}
              </div>
              <p className="text-xs text-muted-foreground">
                전체의{" "}
                {filteredInvoices.length > 0
                  ? Math.round(
                      (filteredInvoices.filter((invoice) => invoice.status === "approved").length /
                        filteredInvoices.length) *
                        100,
                    )
                  : 0}
                %
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 금액</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{Math.round(calculateTotalAmount()).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${Math.round(calculateTotalAmountInUSD()).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredInvoices.filter((invoice) => invoice.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">승인 대기 중인 인보이스</p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue={activeTab}
          className="w-full"
          onValueChange={(value) => router.push(`/dashboard?tab=${value}`)}
        >
          <TabsList>
            <TabsTrigger value="customer">Customer Invoice</TabsTrigger>
            <TabsTrigger value="supplier">Supplier Invoice</TabsTrigger>
          </TabsList>

          <TabsContent value="customer">
            <Card>
              <CardHeader>
                <CardTitle>Customer Invoice 목록</CardTitle>
                <CardDescription>내가 신청한 Customer Invoice 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>인보이스 번호</TableHead>
                      <TableHead>고객사</TableHead>
                      <TableHead>프로젝트</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>신청일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.filter((inv) => inv.type === "customer").length > 0 ? (
                      filteredInvoices
                        .filter((inv) => inv.type === "customer")
                        .map((invoice) => (
                          <TableRow key={invoice.invoiceNumber}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>{invoice.customerName}</TableCell>
                            <TableCell>{invoice.projectName}</TableCell>
                            <TableCell>
                              <div>
                                {formatCurrency(invoice.totalAmount, invoice.currency || "KRW")}
                                {(invoice.currency === "KRW" || invoice.currency === "USD") && (
                                  <div className="text-xs text-muted-foreground">
                                    {getSecondaryCurrencyDisplay(invoice.totalAmount, invoice.currency || "KRW")}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                                {getStatusText(invoice.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="icon" onClick={() => showInvoiceDetails(invoice)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <DeleteConfirmationDialog
                                  title="인보이스 삭제"
                                  description={`정말로 인보이스 ${invoice.invoiceNumber}를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
                                  onDelete={() => handleDeleteInvoice(invoice.invoiceNumber)}
                                  disabled={!canDeleteInvoice(invoice.createdBy, invoice.status)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          <p className="text-muted-foreground">Customer Invoice가 없습니다.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supplier">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Invoice 목록</CardTitle>
                <CardDescription>내가 신청한 Supplier Invoice 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>인보이스 번호</TableHead>
                      <TableHead>공급업체</TableHead>
                      <TableHead>프로젝트</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>신청일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.filter((inv) => inv.type === "supplier").length > 0 ? (
                      filteredInvoices
                        .filter((inv) => inv.type === "supplier")
                        .map((invoice) => (
                          <TableRow key={invoice.invoiceNumber}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>{invoice.supplierName}</TableCell>
                            <TableCell>{invoice.projectName}</TableCell>
                            <TableCell>
                              <div>
                                {formatCurrency(invoice.totalAmount, invoice.currency || "KRW")}
                                {(invoice.currency === "KRW" || invoice.currency === "USD") && (
                                  <div className="text-xs text-muted-foreground">
                                    {getSecondaryCurrencyDisplay(invoice.totalAmount, invoice.currency || "KRW")}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                                {getStatusText(invoice.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="icon" onClick={() => showInvoiceDetails(invoice)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <DeleteConfirmationDialog
                                  title="인보이스 삭제"
                                  description={`정말로 인보이스 ${invoice.invoiceNumber}를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
                                  onDelete={() => handleDeleteInvoice(invoice.invoiceNumber)}
                                  disabled={!canDeleteInvoice(invoice.createdBy, invoice.status)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          <p className="text-muted-foreground">Supplier Invoice가 없습니다.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 인보이스 상세 정보 다이얼로그 */}
        {selectedInvoice && (
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>인보이스 상세 정보</DialogTitle>
                <DialogDescription>인보이스 번호: {selectedInvoice.invoiceNumber}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* 인보이스 기본 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">인보이스 유형</h3>
                    <p className="text-base">
                      {selectedInvoice.type === "customer" ? "Customer Invoice" : "Supplier Invoice"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">프로젝트명</h3>
                    <p className="text-base">{selectedInvoice.projectName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {selectedInvoice.type === "customer" ? "고객사" : "공급업체"}
                    </h3>
                    <p className="text-base">
                      {selectedInvoice.type === "customer"
                        ? selectedInvoice.customerName
                        : selectedInvoice.supplierName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">금액</h3>
                    <div>
                      <p className="text-base">
                        {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency || "KRW")}
                      </p>
                      {(selectedInvoice.currency === "KRW" || selectedInvoice.currency === "USD") && (
                        <p className="text-xs text-muted-foreground">
                          {getSecondaryCurrencyDisplay(selectedInvoice.totalAmount, selectedInvoice.currency || "KRW")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">신청자</h3>
                    <p className="text-base">{selectedInvoice.createdBy}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">신청일</h3>
                    <p className="text-base">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Plus One 정보 (있는 경우) */}
                {selectedInvoice.type === "customer" && selectedInvoice.referrerEmail && (
                  <div className="border rounded-md p-4">
                    <h3 className="text-base font-medium mb-2">Plus One 정보</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">소개자 이름</h4>
                        <p>{selectedInvoice.referrerName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">소개자 이메일</h4>
                        <p>{selectedInvoice.referrerEmail}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">소개자 부서</h4>
                        <p>{selectedInvoice.referrerDepartment}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Plus One 금액</h4>
                        <p>{formatCurrency(selectedInvoice.referralAmount || 0, selectedInvoice.currency || "KRW")}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fee Sharing 정보 (있는 경우) */}
                {selectedInvoice.feeShares && selectedInvoice.feeShares.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h3 className="text-base font-medium mb-2">Fee Sharing 정보</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이메일</TableHead>
                          <TableHead>팀</TableHead>
                          <TableHead>금액</TableHead>
                          <TableHead>비율</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.feeShares.map((share) => (
                          <TableRow key={share.id}>
                            <TableCell>{share.email}</TableCell>
                            <TableCell>{share.team}</TableCell>
                            <TableCell>{formatCurrency(share.amount, selectedInvoice.currency || "KRW")}</TableCell>
                            <TableCell>{share.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* 승인 진행 상황 */}
                <div className="border rounded-md p-4">
                  <ApprovalStatus
                    steps={
                      selectedInvoice.approvalSteps ||
                      selectedInvoice.approvers.map((approver) => ({
                        id: approver.id,
                        email: approver.email,
                        status: "pending",
                      }))
                    }
                    currentStep={selectedInvoice.currentApprovalStep}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
