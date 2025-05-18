import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 인보이스 번호 생성 함수 수정
export function generateInvoiceNumber(prefix: string): string {
  // 오늘 날짜를 YYYYMMDD 형식으로 변환
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  const dateString = `${year}${month}${day}`

  // 로컬 스토리지에서 기존 인보이스 가져오기
  const storedInvoices = localStorage.getItem("invoices") || "[]"
  const invoices = JSON.parse(storedInvoices)

  // 오늘 날짜에 해당하는 인보이스 중 같은 접두사를 가진 인보이스 필터링
  const todayInvoices = invoices.filter((invoice: any) => {
    // 인보이스 번호 형식: PREFIX-YYYYMMDD-XXX
    const invoiceNumber = invoice.invoiceNumber || ""
    const parts = invoiceNumber.split("-")

    // 형식이 맞는지 확인
    if (parts.length !== 3) return false

    // 접두사와 날짜가 일치하는지 확인
    return parts[0] === prefix && parts[1] === dateString
  })

  // 오늘 등록된 마지막 일련번호 찾기
  let lastSequence = 0
  if (todayInvoices.length > 0) {
    // 모든 인보이스 번호에서 일련번호 부분 추출
    const sequences = todayInvoices.map((invoice: any) => {
      const sequencePart = invoice.invoiceNumber.split("-")[2]
      return Number.parseInt(sequencePart, 10)
    })

    // 가장 큰 일련번호 찾기
    lastSequence = Math.max(...sequences)
  }

  // 다음 일련번호 생성 (1부터 시작하므로 +1)
  const nextSequence = lastSequence + 1
  const sequenceString = String(nextSequence).padStart(3, "0")

  // 최종 인보이스 번호 생성
  return `${prefix}-${dateString}-${sequenceString}`
}

// 인보이스 번호 중복 확인 및 고유 번호 생성 함수
export function ensureUniqueInvoiceNumber(invoiceNumber: string): string {
  // 로컬 스토리지에서 기존 인보이스 가져오기
  const storedInvoices = localStorage.getItem("invoices") || "[]"
  const invoices = JSON.parse(storedInvoices)

  // 인보이스 번호 분해
  const parts = invoiceNumber.split("-")
  if (parts.length !== 3) return invoiceNumber // 형식이 맞지 않으면 원래 번호 반환

  const prefix = parts[0]
  const dateString = parts[1]
  let sequence = Number.parseInt(parts[2], 10)

  // 중복 확인
  let uniqueNumber = invoiceNumber
  let isDuplicate = true

  while (isDuplicate) {
    // 현재 번호가 이미 존재하는지 확인
    const exists = invoices.some((invoice: any) => invoice.invoiceNumber === uniqueNumber)

    if (!exists) {
      // 중복이 없으면 루프 종료
      isDuplicate = false
    } else {
      // 중복이 있으면 일련번호 증가
      sequence++
      uniqueNumber = `${prefix}-${dateString}-${String(sequence).padStart(3, "0")}`
    }
  }

  return uniqueNumber
}
