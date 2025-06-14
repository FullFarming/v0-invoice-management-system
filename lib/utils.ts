import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique invoice number with a specified prefix
 * Format: PREFIX-YYYYMMDD-XXXX where XXXX is a random 4-digit number
 */
export function generateInvoiceNumber(prefix = "INV"): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const datePart = `${year}${month}${day}`

  // Generate random 4-digit number
  const randomPart = Math.floor(1000 + Math.random() * 9000)

  return `${prefix}-${datePart}-${randomPart}`
}
