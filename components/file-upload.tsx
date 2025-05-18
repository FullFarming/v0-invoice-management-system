"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp, Check, X } from "lucide-react"

interface FileUploadProps {
  label: string
  id: string
  accept: string
  required: boolean
  onUpload: (file: File) => void
}

export function FileUpload({ label, id, accept, required, onUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      handleUpload(selectedFile)
    }
  }

  const handleUpload = async (selectedFile: File) => {
    setUploading(true)
    setError(null)

    try {
      // 실제 구현에서는 API 호출로 파일 업로드
      // 여기서는 시뮬레이션만 수행
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onUpload(selectedFile)
      setUploaded(true)
    } catch (err) {
      setError("파일 업로드에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            required={required}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
          <div className="flex items-center border rounded-md px-3 py-2 text-sm">
            <FileUp className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="flex-1 truncate">{file ? file.name : "파일을 선택하세요"}</span>
          </div>
        </div>
        {uploading && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>}
        {uploaded && !uploading && <Check className="h-5 w-5 text-green-500" />}
        {error && !uploading && <X className="h-5 w-5 text-red-500" />}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
