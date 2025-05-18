"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MultiEmailInputProps {
  options: { value: string; label: string }[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder: string
  emptyMessage: string
  className?: string
}

export function MultiEmailInput({
  options,
  values,
  onChange,
  placeholder,
  emptyMessage,
  className,
}: MultiEmailInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (value: string) => {
    if (!values.includes(value)) {
      onChange([...values, value])
    }
    setInputValue("")
  }

  const handleRemove = (valueToRemove: string) => {
    onChange(values.filter((value) => value !== valueToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault()
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(inputValue) && !values.includes(inputValue)) {
        onChange([...values, inputValue])
        setInputValue("")
      }
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((value) => {
          const option = options.find((opt) => opt.value === value)
          const label = option ? option.label : value

          return (
            <Badge key={value} variant="secondary" className="px-2 py-1">
              {label}
              <button
                type="button"
                onClick={() => handleRemove(value)}
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center border rounded-md px-3 py-2 w-full">
            <input
              className="flex-1 bg-transparent outline-none"
              placeholder={values.length === 0 ? placeholder : "이메일 추가..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`${placeholder} 검색...`} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {options
                  .filter((option) => !values.includes(option.value))
                  .map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        handleSelect(option.value)
                        setOpen(false)
                      }}
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      {option.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
