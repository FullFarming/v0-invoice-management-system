"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AutoComplete } from "@/components/auto-complete"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash, ArrowDown, Search, UserPlus } from "lucide-react"
import { getApproverOptions, getSuggestedApprovers, type Employee } from "@/lib/employee-data"
import { EmployeeSearch } from "@/components/employee-search"

export interface Approver {
  id: string
  email: string
  level: number
  name?: string
  position?: string
  department?: string
}

interface ApproverSelectionProps {
  approvers: Approver[]
  onChange: (approvers: Approver[]) => void
  currentUserEmail?: string
}

export function ApproverSelection({ approvers, onChange, currentUserEmail }: ApproverSelectionProps) {
  const [newApproverEmail, setNewApproverEmail] = useState("")
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [suggestedApprovers, setSuggestedApprovers] = useState<Employee[]>([])

  // 승인권자 옵션 가져오기
  const approverOptions = getApproverOptions()

  // 현재 사용자 이메일이 있으면 추천 승인권자 가져오기
  useEffect(() => {
    if (currentUserEmail) {
      const suggested = getSuggestedApprovers(currentUserEmail, 3)
      setSuggestedApprovers(suggested)
    }
  }, [currentUserEmail])

  const addApprover = () => {
    if (newApproverEmail) {
      const newLevel = approvers.length > 0 ? Math.max(...approvers.map((a) => a.level)) + 1 : 1

      // 이메일에서 이름과 부서 추출
      const selectedOption = approverOptions.find((option) => option.value === newApproverEmail)
      const name = selectedOption ? selectedOption.label.split("(")[0].trim() : undefined
      const positionDept = selectedOption ? selectedOption.label.split("(")[1]?.replace(")", "") : undefined
      const position = positionDept ? positionDept.split("-")[0]?.trim() : undefined
      const department = positionDept ? positionDept.split("-")[1]?.trim() : undefined

      const newApprover: Approver = {
        id: Date.now().toString(),
        email: newApproverEmail,
        level: newLevel,
        name,
        position,
        department,
      }

      onChange([...approvers, newApprover])
      setNewApproverEmail("")
    }
  }

  const addApproverFromSearch = (employee: Employee) => {
    const newLevel = approvers.length > 0 ? Math.max(...approvers.map((a) => a.level)) + 1 : 1

    const newApprover: Approver = {
      id: Date.now().toString(),
      email: employee.email,
      level: newLevel,
      name: employee.name,
      position: employee.position,
      department: employee.department,
    }

    onChange([...approvers, newApprover])
    setSearchDialogOpen(false)
  }

  const removeApprover = (id: string) => {
    const filteredApprovers = approvers.filter((approver) => approver.id !== id)

    // 승인 레벨 재조정
    const updatedApprovers = filteredApprovers.map((approver, index) => ({
      ...approver,
      level: index + 1,
    }))

    onChange(updatedApprovers)
  }

  const moveApproverUp = (id: string) => {
    const index = approvers.findIndex((approver) => approver.id === id)
    if (index <= 0) return // 이미 첫 번째 항목이면 이동 불가

    const newApprovers = [...approvers]

    // 현재 항목과 이전 항목의 레벨 교환
    const currentLevel = newApprovers[index].level
    newApprovers[index].level = newApprovers[index - 1].level
    newApprovers[index - 1].level = currentLevel

    // 레벨에 따라 정렬
    newApprovers.sort((a, b) => a.level - b.level)

    onChange(newApprovers)
  }

  const moveApproverDown = (id: string) => {
    const index = approvers.findIndex((approver) => approver.id === id)
    if (index >= approvers.length - 1) return // 이미 마지막 항목이면 이동 불가

    const newApprovers = [...approvers]

    // 현재 항목과 다음 항목의 레벨 교환
    const currentLevel = newApprovers[index].level
    newApprovers[index].level = newApprovers[index + 1].level
    newApprovers[index + 1].level = currentLevel

    // 레벨에 따라 정렬
    newApprovers.sort((a, b) => a.level - b.level)

    onChange(newApprovers)
  }

  // 추천 승인권자 추가
  const addSuggestedApprover = (employee: Employee) => {
    const newLevel = approvers.length > 0 ? Math.max(...approvers.map((a) => a.level)) + 1 : 1

    const newApprover: Approver = {
      id: Date.now().toString(),
      email: employee.email,
      level: newLevel,
      name: employee.name,
      position: employee.position,
      department: employee.department,
    }

    onChange([...approvers, newApprover])
  }

  // 레벨에 따라 정렬된 승인자 목록
  const sortedApprovers = [...approvers].sort((a, b) => a.level - b.level)

  return (
    <div className="space-y-4">
      <div className="font-medium text-lg">승인 워크플로우</div>

      {/* 추천 승인권자 표시 */}
      {suggestedApprovers.length > 0 && approvers.length === 0 && (
        <div className="mb-4 p-3 border rounded-md bg-blue-50 border-blue-200">
          <div className="font-medium mb-2">추천 승인권자</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {suggestedApprovers.map((employee) => (
              <Button
                key={employee.email}
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => addSuggestedApprover(employee)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-xs text-muted-foreground">{employee.position}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {sortedApprovers.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>승인 단계</TableHead>
              <TableHead>승인자 정보</TableHead>
              <TableHead className="w-[120px]">순서 변경</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApprovers.map((approver, index) => (
              <TableRow key={approver.id}>
                <TableCell>Level {approver.level}</TableCell>
                <TableCell>
                  <div>
                    {approver.name ? (
                      <>
                        <div className="font-medium">{approver.name}</div>
                        <div className="text-sm text-muted-foreground">{approver.email}</div>
                        {approver.position && (
                          <div className="text-xs text-muted-foreground">
                            {approver.position} {approver.department ? `- ${approver.department}` : ""}
                          </div>
                        )}
                      </>
                    ) : (
                      <div>{approver.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveApproverUp(approver.id)}
                      disabled={index === 0}
                      className="h-8 w-8"
                    >
                      <ArrowDown className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveApproverDown(approver.id)}
                      disabled={index === sortedApprovers.length - 1}
                      className="h-8 w-8"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeApprover(approver.id)}
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
          <Label htmlFor="new-approver-email">승인자 이메일</Label>
          <AutoComplete
            options={approverOptions}
            value={newApproverEmail}
            onChange={setNewApproverEmail}
            placeholder="승인자 이메일 선택 또는 입력"
            emptyMessage="검색 결과가 없습니다."
          />
        </div>
        <Button
          type="button"
          onClick={addApprover}
          className="bg-[#1a1144] hover:bg-[#2c1d5d] text-white"
          disabled={!newApproverEmail}
        >
          <Plus className="mr-1 h-4 w-4" />
          승인자 추가
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSearchDialogOpen(true)}
          className="border-[#1a1144] text-[#1a1144]"
        >
          <Search className="mr-1 h-4 w-4" />
          검색
        </Button>
      </div>

      {sortedApprovers.length === 0 && (
        <div className="text-sm text-muted-foreground mt-2">
          최소 한 명의 승인자를 추가해주세요. 승인자를 여러 명 추가하면 순차적으로 승인 절차가 진행됩니다.
        </div>
      )}

      {/* 직원 검색 다이얼로그 */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>승인자 검색</DialogTitle>
          </DialogHeader>
          <EmployeeSearch
            onSelect={addApproverFromSearch}
            showSelectButton={true}
            placeholder="승인자 이름 또는 이메일로 검색..."
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
