"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, User, Mail, Building, Briefcase } from "lucide-react"
import {
  getDepartments,
  getPositions,
  searchEmployeesByEmail,
  searchEmployeesByName,
  getEmployeesByDepartment,
  getEmployeesByPosition,
  type Employee,
} from "@/lib/employee-data"

interface EmployeeSearchProps {
  onSelect?: (employee: Employee) => void
  showSelectButton?: boolean
  placeholder?: string
}

export function EmployeeSearch({
  onSelect,
  showSelectButton = false,
  placeholder = "이름 또는 이메일로 검색...",
}: EmployeeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Employee[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [activeTab, setActiveTab] = useState("search")

  const departments = getDepartments()
  const positions = getPositions()

  // 검색어 변경 시 결과 업데이트
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }

    // 이메일 형식인지 확인
    if (searchQuery.includes("@")) {
      setSearchResults(searchEmployeesByEmail(searchQuery))
    } else {
      setSearchResults(searchEmployeesByName(searchQuery))
    }
  }, [searchQuery])

  // 부서 선택 시 결과 업데이트
  useEffect(() => {
    if (selectedDepartment) {
      setSearchResults(getEmployeesByDepartment(selectedDepartment))
    }
  }, [selectedDepartment])

  // 직급 선택 시 결과 업데이트
  useEffect(() => {
    if (selectedPosition) {
      setSearchResults(getEmployeesByPosition(selectedPosition))
    }
  }, [selectedPosition])

  // 탭 변경 시 초기화
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchResults([])
    setSearchQuery("")
    setSelectedDepartment("")
    setSelectedPosition("")
  }

  // 직원 선택 처리
  const handleSelectEmployee = (employee: Employee) => {
    if (onSelect) {
      onSelect(employee)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>직원 검색</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="search">이름/이메일 검색</TabsTrigger>
            <TabsTrigger value="department">부서별 검색</TabsTrigger>
            <TabsTrigger value="position">직급별 검색</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={placeholder}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="department">
            <div className="mb-4">
              <Label htmlFor="department" className="mb-2 block">
                부서 선택
              </Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="position">
            <div className="mb-4">
              <Label htmlFor="position" className="mb-2 block">
                직급 선택
              </Label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="직급 선택" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* 검색 결과 테이블 */}
          {searchResults.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>직급</TableHead>
                  <TableHead>부서</TableHead>
                  <TableHead>이메일</TableHead>
                  {showSelectButton && <TableHead className="w-[80px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((employee) => (
                  <TableRow key={employee.email}>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{employee.name}</div>
                          {employee.koreanName && (
                            <div className="text-xs text-muted-foreground">{employee.koreanName}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                        {employee.position}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                        {employee.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        {employee.email}
                      </div>
                    </TableCell>
                    {showSelectButton && (
                      <TableCell>
                        <Button size="sm" onClick={() => handleSelectEmployee(employee)} className="w-full">
                          선택
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {searchResults.length === 0 && ((activeTab === "search" && searchQuery) || activeTab !== "search") && (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
