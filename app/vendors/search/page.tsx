"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { vendors } from "@/lib/data"

export default function VendorSearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("name") // 'name' 또는 'businessNumber'
  const [searchResults, setSearchResults] = useState<typeof vendors>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [filteredVendors, setFilteredVendors] = useState<typeof vendors>([])

  // 검색어 입력 시 실시간 필터링
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = vendors.filter((vendor) => {
        if (searchType === "name") {
          return vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
        } else {
          return vendor.businessNumber.includes(searchTerm)
        }
      })
      setFilteredVendors(filtered)
    } else {
      setFilteredVendors([])
    }
  }, [searchTerm, searchType])

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setSearchResults(filteredVendors)
    setHasSearched(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Search Vendors</h1>
          <p className="text-muted-foreground">벤더 정보를 검색할 수 있습니다.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Vendors</CardTitle>
            <CardDescription>벤더명 또는 사업자 번호로 검색하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="name" onValueChange={(value) => setSearchType(value)}>
              <TabsList>
                <TabsTrigger value="name">벤더명 검색</TabsTrigger>
                <TabsTrigger value="businessNumber">사업자 번호 검색</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={searchType === "name" ? "벤더명 입력..." : "사업자 번호 입력..."}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {filteredVendors.length > 0 && searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                    {filteredVendors.slice(0, 5).map((vendor) => (
                      <div
                        key={vendor.id}
                        className="px-4 py-2 cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setSearchTerm(searchType === "name" ? vendor.name : vendor.businessNumber)
                          setFilteredVendors([])
                        }}
                      >
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground">{vendor.businessNumber}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleSearch}>검색</Button>
            </div>

            {hasSearched && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">검색 결과 ({searchResults.length})</h3>
                {searchResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>벤더명</TableHead>
                        <TableHead>사업자 번호</TableHead>
                        <TableHead className="hidden md:table-cell">담당자</TableHead>
                        <TableHead className="hidden md:table-cell">연락처</TableHead>
                        <TableHead className="hidden lg:table-cell">카테고리</TableHead>
                        <TableHead className="hidden lg:table-cell">최근 거래일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell>{vendor.businessNumber}</TableCell>
                          <TableCell className="hidden md:table-cell">{vendor.contactName}</TableCell>
                          <TableCell className="hidden md:table-cell">{vendor.contactPhone}</TableCell>
                          <TableCell className="hidden lg:table-cell">{vendor.category}</TableCell>
                          <TableCell className="hidden lg:table-cell">{vendor.lastTransaction}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-4 border rounded-md">
                    <p>검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 거래 Vendors</CardTitle>
            <CardDescription>최근에 거래한 벤더 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>벤더명</TableHead>
                  <TableHead>사업자 번호</TableHead>
                  <TableHead className="hidden md:table-cell">담당자</TableHead>
                  <TableHead className="hidden md:table-cell">연락처</TableHead>
                  <TableHead className="hidden lg:table-cell">카테고리</TableHead>
                  <TableHead className="hidden lg:table-cell">최근 거래일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.slice(0, 5).map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.businessNumber}</TableCell>
                    <TableCell className="hidden md:table-cell">{vendor.contactName}</TableCell>
                    <TableCell className="hidden md:table-cell">{vendor.contactPhone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{vendor.category}</TableCell>
                    <TableCell className="hidden lg:table-cell">{vendor.lastTransaction}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
