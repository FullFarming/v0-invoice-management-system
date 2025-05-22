"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getCompaniesByType, getCompanyByName, type Company } from "@/lib/company-data"

interface CompanySelectProps {
  type: "customer" | "supplier"
  value: string
  onChange: (value: string, company: Company | null) => void
}

export function CompanySelect({ type, value, onChange }: CompanySelectProps) {
  const [open, setOpen] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  useEffect(() => {
    // Load companies based on type
    const loadedCompanies = getCompaniesByType(type)
    setCompanies(loadedCompanies)

    // If there's a value, try to find the corresponding company
    if (value) {
      const company = getCompanyByName(value)
      setSelectedCompany(company || null)
    }
  }, [type, value])

  const handleSelect = (companyName: string) => {
    const company = companies.find((c) => c.name === companyName) || null
    setSelectedCompany(company)
    onChange(companyName, company)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value || `${type === "customer" ? "고객사" : "공급업체"} 선택`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder={`${type === "customer" ? "고객사" : "공급업체"} 검색...`} />
          <CommandList>
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem key={company.id} value={company.name} onSelect={handleSelect}>
                  <Check className={cn("mr-2 h-4 w-4", value === company.name ? "opacity-100" : "opacity-0")} />
                  {company.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
