"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ApprovalActions } from "@/components/approval-actions"
import { ApprovalStatus, type ApprovalStep } from "@/components/approval-status"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Clock, Eye, DollarSign } from "lucide-react"
import { formatCurrency, getSecondaryCurrencyDisplay } from "@/lib/currency"

// 인보이스 타입 정의
interface Invoice {
  invoiceNumber: string
  customerName?: string
  supplierName?: string
  projectName: string
  totalAmount: number
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
  currency?: string
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

// Fee Sharing 할당 정보 인터페이스
interface FeeAllocation {
  invoiceNumber: string
  projectName: string
  amount: number
  percentage: number
  currency?: string
  status: "pending" | "approved" | "rejected"
  invoice: Invoice
}

export default function InboxPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [pendingApprovals, setPendingApprovals] = useState<Invoice[]>([])
  const [completedApprovals, setCompletedApprovals] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  // 내 할당 Fee 목록
  const [myAllocations, setMyAllocations] = useState<FeeAllocation[]>([])

  // 내 승인 대기 목록
  const [awaitingApprovals, setAwaitingApprovals] = useState<Invoice[]>([])

  // 승인 대기 중인 인보이스 로드
  useEffect(() => {
    if (!user?.email) return

    // 로컬 스토리지에서 인보이스 데이터 로드
    const loadInvoices = () => {
      const storedInvoices = localStorage.getItem("invoices") || "[]"
      const allInvoices = JSON.parse(storedInvoices) as Invoice[]

      // 현재 사용자가 승인해야 하는 인보이스 필터링
      const pending = allInvoices.filter((invoice) => {
        // 현재 승인 단계의 승인자가 현재 사용자인지 확인
        const currentApprover = invoice.approvers.find((approver) => approver.level === invoice.currentApprovalStep)
        return invoice.status === "pending" && currentApprover && currentApprover.email === user.email
      })

      // 현재 사용자가 이미 승인했거나 거부한 인보이스 필터링
      const completed = allInvoices.filter((invoice) => {
        // 사용자가 승인자 목록에 있는지 확인
        const userIsApprover = invoice.approvers.some((approver) => approver.email === user.email)
        // 현재 승인 단계가 사용자의 승인 단계보다 큰지 확인 (이미 승인됨)
        const userApprovalLevel = invoice.approvers.find((approver) => approver.email === user.email)?.level || 0

        return userIsApprover && (invoice.status !== "pending" || invoice.currentApprovalStep > userApprovalLevel)
      })

      // 현재 사용자에게 할당된 Fee Sharing 찾기
      const allocations: FeeAllocation[] = []
      allInvoices.forEach((invoice) => {
        if (invoice.feeShares) {
          const myShare = invoice.feeShares.find((share) => share.email === user.email)
          if (myShare) {
            allocations.push({
              invoiceNumber: invoice.invoiceNumber,
              projectName: invoice.projectName,
              amount: myShare.amount,
              percentage: myShare.percentage,
              currency: invoice.currency,
              status: invoice.status,
              invoice: invoice,
            })
          }
        }
      })

      // 승인 대기 중인 인보이스 중 현재 사용자가 승인해야 하는 인보이스 필터링
      const awaiting = allInvoices.filter((invoice) => {
        if (invoice.status !== "pending") return false
        const currentApprover = invoice.approvers.find((approver) => approver.level === invoice.currentApprovalStep)
        return currentApprover && currentApprover.email === user.email
      })

      setPendingApprovals(pending)
      setCompletedApprovals(completed)
      setMyAllocations(allocations)
      setAwaitingApprovals(awaiting)
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

  // 인보이스 승인 처리
  const handleApprove = (invoice: Invoice) => {
    // 로컬 스토리지에서 인보이스 데이터 로드
    const storedInvoices = localStorage.getItem("invoices") || "[]"
    const allInvoices = JSON.parse(storedInvoices) as Invoice[]

    // 해당 인보이스 찾기
    const invoiceIndex = allInvoices.findIndex((inv) => inv.invoiceNumber === invoice.invoiceNumber)
    if (invoiceIndex === -1) return

    // 승인 단계 업데이트
    const updatedInvoice = { ...allInvoices[invoiceIndex] }

    // 승인 단계 기록 추가
    if (!updatedInvoice.approvalSteps) {
      updatedInvoice.approvalSteps = updatedInvoice.approvers.map((approver) => ({
        id: approver.id,
        email: approver.email,
        status: "pending",
      }))
    }

    // 현재 승인 단계 업데이트
    const currentStepIndex = updatedInvoice.currentApprovalStep - 1
    if (updatedInvoice.approvalSteps[currentStepIndex]) {
      updatedInvoice.approvalSteps[currentStepIndex].status = "approved"
      updatedInvoice.approvalSteps[currentStepIndex].timestamp = new Date().toISOString()
    }

    // 다음 승인 단계로 이동
    updatedInvoice.currentApprovalStep += 1

    // 모든 승인 단계가 완료되었는지 확인
    if (updatedInvoice.currentApprovalStep > updatedInvoice.approvers.length) {
      updatedInvoice.status = "approved"

      // PDF 생성 로직은 실제로는 서버에서 처리
      toast({
        title: "승인 완료",
        description: `인보이스 ${invoice.invoiceNumber}가 모든 승인 단계를 통과했습니다. PDF가 생성되었습니다.`,
      })
    } else {
      toast({
        title: "승인 완료",
        description: `인보이스 ${invoice.invoiceNumber}가 승인되었습니다. 다음 승인자에게 알림이 전송되었습니다.`,
      })
    }

    // 인보이스 업데이트
    allInvoices[invoiceIndex] = updatedInvoice
    localStorage.setItem("invoices", JSON.stringify(allInvoices))

    // 상태 업데이트
    setPendingApprovals(pendingApprovals.filter((inv) => inv.invoiceNumber !== invoice.invoiceNumber))
    setCompletedApprovals([updatedInvoice, ...completedApprovals])
    setDetailsOpen(false)
  }

  // 인보이스 거부 처리
  const handleReject = (invoice: Invoice, comment: string) => {
    // 로컬 스토리지에서 인보이스 데이터 로드
    const storedInvoices = localStorage.getItem("invoices") || "[]"
    const allInvoices = JSON.parse(storedInvoices) as Invoice[]

    // 해당 인보이스 찾기
    const invoiceIndex = allInvoices.findIndex((inv) => inv.invoiceNumber === invoice.invoiceNumber)
    if (invoiceIndex === -1) return

    // 거부 처리
    const updatedInvoice = { ...allInvoices[invoiceIndex] }

    // 승인 단계 기록 추가
    if (!updatedInvoice.approvalSteps) {
      updatedInvoice.approvalSteps = updatedInvoice.approvers.map((approver) => ({
        id: approver.id,
        email: approver.email,
        status: "pending",
      }))
    }

    // 현재 승인 단계 업데이트
    const currentStepIndex = updatedInvoice.currentApprovalStep - 1
    if (updatedInvoice.approvalSteps[currentStepIndex]) {
      updatedInvoice.approvalSteps[currentStepIndex].status = "rejected"
      updatedInvoice.approvalSteps[currentStepIndex].comment = comment
      updatedInvoice.approvalSteps[currentStepIndex].timestamp = new Date().toISOString()
    }

    // 인보이스 상태 업데이트
    updatedInvoice.status = "rejected"

    // 인보이스 업데이트
    allInvoices[invoiceIndex] = updatedInvoice
    localStorage.setItem("invoices", JSON.stringify(allInvoices))

    toast({
      title: "승인 거부",
      description: `인보이스 ${invoice.invoiceNumber}가 거부되었습니다. 신청자에게 알림이 전송되었습니다.`,
    })

    // 상태 업데이트
    setPendingApprovals(pendingApprovals.filter((inv) => inv.invoiceNumber !== invoice.invoiceNumber))
    setCompletedApprovals([updatedInvoice, ...completedApprovals])
    setDetailsOpen(false)
  }

  // 인보이스 상세 정보 보기
  const showInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailsOpen(true)
  }

  // My Allocation Fee 총액 계산
  const calculateMyAllocationTotal = useMemo(() => {
    return myAllocations.reduce((sum, allocation) => {
      // 통화가 KRW가 아닌 경우 환산 (간단한 예시)
      if (allocation.currency && allocation.currency !== "KRW") {
        if (allocation.currency === "USD") {
          return sum + allocation.amount * 1478.25 // USD to KRW
        }
        // 다른 통화에 대한 환산 로직 추가 가능
        return sum + allocation.amount
      }
      return sum + allocation.amount
    }, 0)
  }, [myAllocations])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-muted-foreground">승인 요청, 할당 Fee 및 처리 현황을 확인할 수 있습니다.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals.length}</div>
              <p className="text-xs text-muted-foreground">내 승인을 기다리는 인보이스</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Allocation Fee</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{Math.round(calculateMyAllocationTotal).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">총 {myAllocations.length}개 인보이스</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">처리 완료</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedApprovals.length}</div>
              <p className="text-xs text-muted-foreground">내가 처리한 인보이스</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">승인 대기 ({pendingApprovals.length})</TabsTrigger>
            <TabsTrigger value="myAllocation">My Allocation Fee ({myAllocations.length})</TabsTrigger>
            <TabsTrigger value="awaitingApproval">Awaiting Approval ({awaitingApprovals.length})</TabsTrigger>
            <TabsTrigger value="completed">처리 완료 ({completedApprovals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>승인 대기 목록</CardTitle>
                <CardDescription>내가 승인해야 할 인보이스 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>인보이스 번호</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>프로젝트</TableHead>
                        <TableHead>금액</TableHead>
                        <TableHead>신청자</TableHead>
                        <TableHead>신청일</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovals.map((invoice) => (
                        <TableRow key={invoice.invoiceNumber}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {invoice.type === "customer"
                              ? "Customer Invoice"
                              : invoice.type === "supplier"
                                ? "3rd party Invoice"
                                : "Plus One"}
                          </TableCell>
                          <TableCell>{invoice.projectName}</TableCell>
                          <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency || "KRW")}</TableCell>
                          <TableCell>{invoice.createdBy}</TableCell>
                          <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => showInvoiceDetails(invoice)}>
                              <Eye className="mr-2 h-4 w-4" />
                              상세보기
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-2 text-lg font-medium">승인 대기 중인 인보이스가 없습니다.</p>
                    <p className="text-sm text-muted-foreground">새로운 승인 요청이 들어오면 이곳에 표시됩니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="myAllocation">
            <Card>
              <CardHeader>
                <CardTitle>My Allocation Fee</CardTitle>
                <CardDescription>나에게 할당된 Fee Sharing 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                {myAllocations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>인보이스 번호</TableHead>
                        <TableHead>프로젝트</TableHead>
                        <TableHead>할당 금액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myAllocations.map((allocation) => (
                        <TableRow key={allocation.invoiceNumber}>
                          <TableCell className="font-medium">{allocation.invoiceNumber}</TableCell>
                          <TableCell>{allocation.projectName}</TableCell>
                          <TableCell>
                            <div>
                              {formatCurrency(allocation.amount, allocation.currency || "KRW")}
                              {(allocation.currency === "KRW" || allocation.currency === "USD") && (
                                <div className="text-xs text-muted-foreground">
                                  {getSecondaryCurrencyDisplay(allocation.amount, allocation.currency || "KRW")}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-2 text-lg font-medium">할당된 Fee가 없습니다.</p>
                    <p className="text-sm text-muted-foreground">Fee Sharing이 할당되면 이곳에 표시됩니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="awaitingApproval">
            <Card>
              <CardHeader>
                <CardTitle>Awaiting Approval</CardTitle>
                <CardDescription>내 승인을 기다리는 인보이스 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                {awaitingApprovals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>인보이스 번호</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>프로젝트</TableHead>
                        <TableHead>금액</TableHead>
                        <TableHead>신청자</TableHead>
                        <TableHead>신청일</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {awaitingApprovals.map((invoice) => (
                        <TableRow key={invoice.invoiceNumber}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {invoice.type === "customer"
                              ? "Customer Invoice"
                              : invoice.type === "supplier"
                                ? "3rd party Invoice"
                                : "Plus One"}
                          </TableCell>
                          <TableCell>{invoice.projectName}</TableCell>
                          <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency || "KRW")}</TableCell>
                          <TableCell>{invoice.createdBy}</TableCell>
                          <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="icon" onClick={() => showInvoiceDetails(invoice)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => showInvoiceDetails(invoice)}>
                                승인하기
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-2 text-lg font-medium">승인 대기 중인 인보이스가 없습니다.</p>
                    <p className="text-sm text-muted-foreground">새로운 승인 요청이 들어오면 이곳에 표시됩니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>처리 완료 목록</CardTitle>
                <CardDescription>내가 처리한 인보이스 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                {completedApprovals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>인보이스 번호</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>프로젝트</TableHead>
                        <TableHead>금액</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>처리일</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedApprovals.map((invoice) => {
                        // 현재 사용자의 승인 단계 찾기
                        const userApprovalLevel =
                          invoice.approvers.find((approver) => approver.email === user?.email)?.level || 0

                        // 사용자의 승인 상태 찾기
                        const userApprovalStep = invoice.approvalSteps?.find(
                          (step, index) => index + 1 === userApprovalLevel,
                        )

                        const userApprovalStatus = userApprovalStep?.status || "pending"

                        return (
                          <TableRow key={invoice.invoiceNumber}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>
                              {invoice.type === "customer"
                                ? "Customer Invoice"
                                : invoice.type === "supplier"
                                  ? "3rd party Invoice"
                                  : "Plus One"}
                            </TableCell>
                            <TableCell>{invoice.projectName}</TableCell>
                            <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency || "KRW")}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  userApprovalStatus === "approved"
                                    ? "default"
                                    : userApprovalStatus === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {userApprovalStatus === "approved"
                                  ? "승인"
                                  : userApprovalStatus === "rejected"
                                    ? "거부"
                                    : "대기"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {userApprovalStep?.timestamp
                                ? new Date(userApprovalStep.timestamp).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => showInvoiceDetails(invoice)}>
                                <Eye className="mr-2 h-4 w-4" />
                                상세보기
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-2 text-lg font-medium">처리 완료된 인보이스가 없습니다.</p>
                    <p className="text-sm text-muted-foreground">인보이스를 승인하거나 거부하면 이곳에 표시됩니다.</p>
                  </div>
                )}
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
                      {selectedInvoice.type === "customer"
                        ? "Customer Invoice"
                        : selectedInvoice.type === "supplier"
                          ? "3rd party Invoice"
                          : "Plus One"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">프로젝트명</h3>
                    <p className="text-base">{selectedInvoice.projectName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {selectedInvoice.type === "customer"
                        ? "고객사"
                        : selectedInvoice.type === "supplier"
                          ? "공급업체"
                          : "소개자"}
                    </h3>
                    <p className="text-base">
                      {selectedInvoice.type === "customer"
                        ? selectedInvoice.customerName
                        : selectedInvoice.type === "supplier"
                          ? selectedInvoice.supplierName
                          : selectedInvoice.referrerName}
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
                {selectedInvoice.type === "plusone" && selectedInvoice.referrerEmail && (
                  <div className="border rounded-md p-4">
                    <h3 className="text-base font-medium mb-2">Plus One 정보</h3>
                    <div className="grid grid-cols-2 gap-4">
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

                {/* 승인 작업 버튼 */}
                {pendingApprovals.some((inv) => inv.invoiceNumber === selectedInvoice.invoiceNumber) && (
                  <div className="pt-4">
                    <ApprovalActions
                      onApprove={() => handleApprove(selectedInvoice)}
                      onReject={(comment) => handleReject(selectedInvoice, comment)}
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
