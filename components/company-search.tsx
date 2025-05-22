"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Search, AlertCircle } from "lucide-react"
import { searchCompany } from "@/lib/soc-data"

interface CompanySearchProps {
  onCompanyFound: (company: any) => void
}

export function CompanySearch({ onCompanyFound }: CompanySearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResult, setSearchResult] = useState<any | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError("검색어를 입력해주세요.")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      // Simulate API call with delay
      setTimeout(() => {
        const result = searchCompany(searchQuery)
        setSearchResult(result)

        if (result) {
          onCompanyFound(result)
        } else {
          setError("검색 결과가 없습니다. 다른 검색어로 시도해주세요.")
        }

        setIsSearching(false)
      }, 500)
    } catch (err) {
      setError("검색 중 오류가 발생했습니다. 다시 시도해주세요.")
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="회사명 또는 사업자등록번호를 입력하세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? "검색 중..." : "검색"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {searchResult && (
        <Card className={searchResult.isSOC ? "border-orange-300 bg-orange-50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {searchResult.isSOC && <InfoIcon className="h-5 w-5 text-orange-500 mt-0.5" />}
              <div>
                <h3 className="text-lg font-semibold">{searchResult.name}</h3>
                <p className="text-sm text-muted-foreground">
                  사업자등록번호: {searchResult.businessRegistrationNumber}
                </p>
                {searchResult.isSOC ? (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-orange-600">SOC입니다</p>
                    {searchResult.socDetails && (
                      <div className="mt-2 p-3 border rounded-md bg-white">
                        <h4 className="font-medium mb-2">SOC 정보</h4>
                        <div className="space-y-1 text-sm">
                          <p>투자금액: {searchResult.socDetails.investmentAmount}</p>
                          <p>투자비율: {searchResult.socDetails.investmentPercentage}</p>
                          <p>투자일자: {searchResult.socDetails.investmentDate}</p>
                          <p>추가정보: {searchResult.socDetails.additionalInfo}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm">SOC 기업이 아닙니다.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
