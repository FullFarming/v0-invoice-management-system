"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Send, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { toast } from "@/components/ui/use-toast"
import { CompanySearch } from "@/components/company-search"
import { ContactSelection } from "@/components/contact-selection"
import { SOCApprovalQuestions, type SOCApprovalAnswers } from "@/components/soc-approval-questions"
import { ApproverSelection, type Approver } from "@/components/approver-selection"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { CompanyContact } from "@/lib/soc-data"

export default function SOCPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("request")
  const [step, setStep] = useState<"search" | "approval" | "contacts" | "approvers" | "complete">("search")
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  const [requestDetails, setRequestDetails] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [approvalAnswers, setApprovalAnswers] = useState<SOCApprovalAnswers>({
    question1Answer: "",
    question2Checked: false,
    question3Checked: false,
  })
  const [companyContacts, setCompanyContacts] = useState<CompanyContact[]>([])
  const [cushmanContacts, setCushmanContacts] = useState<CompanyContact[]>([])
  const [approvers, setApprovers] = useState<Approver[]>([])
  const [confirmations, setConfirmations] = useState([
    { id: 1, customer: "삼성전자", requestDate: "2023-05-15", status: "Approved", confirmationDate: "2023-05-20" },
    { id: 2, customer: "XYZ Inc", requestDate: "2023-05-10", status: "Pending", confirmationDate: "" },
    { id: 3, customer: "123 Industries", requestDate: "2023-05-05", status: "Rejected", confirmationDate: "" },
  ])

  const handleCompanyFound = (company: any) => {
    setSelectedCompany(company)
    if (company.isSOC) {
      setStep("approval")
    }
  }

  const handleApprovalAnswersChange = (answers: SOCApprovalAnswers) => {
    setApprovalAnswers(answers)
  }

  const handleContactsSelected = (company: CompanyContact[], cushman: CompanyContact[]) => {
    setCompanyContacts(company)
    setCushmanContacts(cushman)
  }

  const handleApproversChange = (newApprovers: Approver[]) => {
    setApprovers(newApprovers)
  }

  const handleContinueToContacts = () => {
    // Validate approval answers
    if (!approvalAnswers.question1Answer) {
      toast({
        title: "오류",
        description: "질문 1에 대한 답변을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!approvalAnswers.question2Checked || !approvalAnswers.question3Checked) {
      toast({
        title: "오류",
        description: "모든 확인 사항에 동의해주세요.",
        variant: "destructive",
      })
      return
    }

    setStep("contacts")
  }

  const handleContinueToApprovers = () => {
    // Validate contacts
    if (companyContacts.length === 0) {
      toast({
        title: "오류",
        description: "최소 한 명 이상의 회사 참석자를 추가해주세요.",
        variant: "destructive",
      })
      return
    }

    if (cushmanContacts.length === 0) {
      toast({
        title: "오류",
        description: "최소 한 명 이상의 쿠시먼 참석자를 추가해주세요.",
        variant: "destructive",
      })
      return
    }

    setStep("approvers")
  }

  const handleSubmit = () => {
    // Validate approvers
    if (approvers.length === 0) {
      toast({
        title: "오류",
        description: "최소 한 명 이상의 승인자를 추가해주세요.",
        variant: "destructive",
      })
      return
    }

    // Simulate submission
    toast({
      title: "성공",
      description: "SOC 승인 요청이 성공적으로 제출되었습니다.",
    })

    // Reset form and go to complete step
    setStep("complete")

    // Switch to confirmation tab after a delay
    setTimeout(() => {
      setActiveTab("confirmation")
      setStep("search")
      setSelectedCompany(null)
      setRequestDetails("")
      setAttachments([])
      setApprovalAnswers({
        question1Answer: "",
        question2Checked: false,
        question3Checked: false,
      })
      setCompanyContacts([])
      setCushmanContacts([])
      setApprovers([])
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case "search":
        return (
          <Card>
            <CardHeader>
              <CardTitle>SOC 확인</CardTitle>
              <CardDescription>회사명 또는 사업자등록번호로 SOC 여부를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanySearch onCompanyFound={handleCompanyFound} />
            </CardContent>
          </Card>
        )

      case "approval":
        return (
          <>
            <SOCApprovalQuestions onChange={handleApprovalAnswersChange} />

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>요청 상세 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="요청 상세 정보를 입력하세요"
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">첨부 파일</p>
                  <FileUpload
                    onFilesSelected={(files) => setAttachments(files)}
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                  {attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">선택된 파일:</p>
                      <ul className="text-sm">
                        {attachments.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleContinueToContacts}>다음: 참석자 추가</Button>
              </CardFooter>
            </Card>
          </>
        )

      case "contacts":
        return (
          <div className="space-y-4">
            <ContactSelection companyName={selectedCompany?.name || ""} onContactsSelected={handleContactsSelected} />

            <div className="flex justify-end">
              <Button onClick={handleContinueToApprovers}>다음: 승인자 추가</Button>
            </div>
          </div>
        )

      case "approvers":
        return (
          <div className="space-y-4">
            <ApproverSelection approvers={approvers} onChange={handleApproversChange} currentUserEmail={user?.email} />

            <div className="flex justify-end">
              <Button onClick={handleSubmit}>
                <Send className="mr-2 h-4 w-4" />
                승인 요청 제출
              </Button>
            </div>
          </div>
        )

      case "complete":
        return (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">승인 요청이 제출되었습니다</h3>
              <p className="text-muted-foreground mb-4">
                SOC 승인 요청이 성공적으로 제출되었습니다. 승인 진행 상황은 확인 탭에서 확인할 수 있습니다.
              </p>
              <Button onClick={() => setActiveTab("confirmation")}>확인 탭으로 이동</Button>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">SOC 관리</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="request">SOC 확인</TabsTrigger>
            <TabsTrigger value="confirmation">일정 등록</TabsTrigger>
            <TabsTrigger value="my">내 일정</TabsTrigger>
          </TabsList>

          <TabsContent value="request">
            {selectedCompany && selectedCompany.isSOC && (
              <Alert className="mb-4 border-orange-300 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertTitle className="text-orange-600">SOC 기업 확인됨</AlertTitle>
                <AlertDescription>
                  {selectedCompany.name}은(는) SOC 기업으로 확인되었습니다. 승인 절차를 진행해주세요.
                </AlertDescription>
              </Alert>
            )}

            {renderStepContent()}
          </TabsContent>

          <TabsContent value="confirmation">
            <Card>
              <CardHeader>
                <CardTitle>SOC 일정 등록</CardTitle>
                <CardDescription>SOC 요청 및 확인 상태를 확인합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">고객사</th>
                        <th className="py-2 px-4 text-left">요청일</th>
                        <th className="py-2 px-4 text-left">상태</th>
                        <th className="py-2 px-4 text-left">승인일</th>
                        <th className="py-2 px-4 text-left">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmations.map((confirmation) => (
                        <tr key={confirmation.id} className="border-b">
                          <td className="py-2 px-4">{confirmation.customer}</td>
                          <td className="py-2 px-4">{confirmation.requestDate}</td>
                          <td className="py-2 px-4">
                            <div className="flex items-center">
                              {getStatusIcon(confirmation.status)}
                              <span className="ml-1">{confirmation.status}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4">{confirmation.confirmationDate || "-"}</td>
                          <td className="py-2 px-4">
                            <Button variant="outline" size="sm">
                              상세 보기
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my">
            <Card>
              <CardHeader>
                <CardTitle>내 일정</CardTitle>
                <CardDescription>내가 참여하는 SOC 일정을 확인합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>현재 등록된 일정이 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
