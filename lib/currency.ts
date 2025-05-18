// 환율 정보 (고정 환율, 실제 구현에서는 API로 최신 환율 가져오기)
export const exchangeRates = {
  KRW: 1, // 기준 통화
  USD: 1478.25, // 1 USD = 1478.25 KRW
  EUR: 1600.5, // 1 EUR = 1600.50 KRW
  JPY: 9.85, // 1 JPY = 9.85 KRW
  CNY: 204.3, // 1 CNY = 204.30 KRW
  GBP: 1880.75, // 1 GBP = 1880.75 KRW
  AUD: 975.4, // 1 AUD = 975.40 KRW
  CAD: 1085.6, // 1 CAD = 1085.60 KRW
  SGD: 1095.3, // 1 SGD = 1095.30 KRW
  HKD: 189.45, // 1 HKD = 189.45 KRW
}

// 통화 옵션 목록
export const currencyOptions = [
  { value: "KRW", label: "KRW (₩)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "JPY", label: "JPY (¥)" },
  { value: "CNY", label: "CNY (¥)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "AUD", label: "AUD ($)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "SGD", label: "SGD ($)" },
  { value: "HKD", label: "HKD ($)" },
]

// 통화 기호
export const currencySymbols: Record<string, string> = {
  KRW: "₩",
  USD: "$",
  EUR: "€",
  JPY: "¥",
  CNY: "¥",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  HKD: "HK$",
}

// 통화 변환 함수
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (!amount) return 0
  if (fromCurrency === toCurrency) return amount

  // 원화로 변환 후 목표 통화로 변환
  const amountInKRW = fromCurrency === "KRW" ? amount : amount * exchangeRates[fromCurrency]
  return toCurrency === "KRW" ? amountInKRW : amountInKRW / exchangeRates[toCurrency]
}

// 통화 형식 지정 함수
export function formatCurrency(amount: number, currency: string): string {
  if (amount === undefined || amount === null) return ""

  const symbol = currencySymbols[currency] || ""

  // 통화별 형식 지정
  switch (currency) {
    case "KRW":
      return `${symbol}${Math.round(amount).toLocaleString()}`
    case "JPY":
      return `${symbol}${Math.round(amount).toLocaleString()}`
    default:
      return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

// 보조 통화 표시 함수 (작은 글씨로 표시할 보조 통화 금액)
export function getSecondaryCurrencyDisplay(amount: number, primaryCurrency: string): string {
  if (!amount) return ""

  // 원화인 경우 USD로 변환하여 표시
  if (primaryCurrency === "KRW") {
    const usdAmount = convertCurrency(amount, "KRW", "USD")
    return `(${formatCurrency(usdAmount, "USD")})`
  }

  // USD인 경우 원화로 변환하여 표시
  if (primaryCurrency === "USD") {
    const krwAmount = convertCurrency(amount, "USD", "KRW")
    return `(${formatCurrency(krwAmount, "KRW")})`
  }

  // 그 외 통화는 보조 표시 없음
  return ""
}
