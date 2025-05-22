export interface SOCRequest {
  id: number
  customerId: number
  customerName: string
  requesterId: number
  requesterName: string
  requestDate: string
  details: string
  status: "pending" | "approved" | "rejected"
  approvedDate?: string
  approverId?: number
  approverName?: string
  rejectedDate?: string
  rejectorId?: number
  rejectorName?: string
  rejectionReason?: string
  attachments: string[]
  isSOC?: boolean
  socDetails?: SOCCompanyDetails
  companyContacts?: CompanyContact[]
  cushmanContacts?: CompanyContact[]
}

export interface SOCConfirmation {
  id: number
  requestId: number
  customerId: number
  customerName: string
  confirmationDate: string
  expiryDate: string
  documentUrl: string
}

export interface SOCCompanyDetails {
  businessRegistrationNumber: string
  investmentAmount: string
  investmentPercentage: string
  investmentDate: string
  additionalInfo: string
}

export interface CompanyContact {
  id: string
  name: string
  email: string
  position: string
  company: string
  type: "company" | "cushman"
}

// Mock database of companies with SOC status
export const companyDatabase = [
  {
    id: 101,
    name: "삼성전자",
    businessRegistrationNumber: "124-81-00998",
    isSOC: true,
    socDetails: {
      investmentAmount: "3,800억 원",
      investmentPercentage: "5.2%",
      investmentDate: "2022-04-18",
      additionalInfo: "직접 및 반도체 인프라 SOC",
    },
  },
  {
    id: 102,
    name: "XYZ Inc",
    businessRegistrationNumber: "120-81-12345",
    isSOC: false,
  },
  {
    id: 103,
    name: "123 Industries",
    businessRegistrationNumber: "130-81-67890",
    isSOC: true,
    socDetails: {
      investmentAmount: "1,200억 원",
      investmentPercentage: "3.5%",
      investmentDate: "2023-01-10",
      additionalInfo: "물류 인프라 SOC",
    },
  },
  {
    id: 104,
    name: "456 Corp",
    businessRegistrationNumber: "140-81-54321",
    isSOC: false,
  },
  {
    id: 105,
    name: "현대건설",
    businessRegistrationNumber: "110-81-12345",
    isSOC: true,
    socDetails: {
      investmentAmount: "2,500억 원",
      investmentPercentage: "4.8%",
      investmentDate: "2022-08-22",
      additionalInfo: "교통 인프라 SOC",
    },
  },
]

// Mock data for SOC requests
export const socRequests: SOCRequest[] = [
  {
    id: 1,
    customerId: 101,
    customerName: "삼성전자",
    requesterId: 201,
    requesterName: "John Doe",
    requestDate: "2023-05-15",
    details: "Need SOC compliance for new project",
    status: "pending",
    attachments: ["SOC_Request_ABC_Corp.pdf"],
    isSOC: true,
    socDetails: {
      businessRegistrationNumber: "124-81-00998",
      investmentAmount: "3,800억 원",
      investmentPercentage: "5.2%",
      investmentDate: "2022-04-18",
      additionalInfo: "직접 및 반도체 인프라 SOC",
    },
  },
  {
    id: 2,
    customerId: 102,
    customerName: "XYZ Inc",
    requesterId: 202,
    requesterName: "Jane Smith",
    requestDate: "2023-05-10",
    details: "Annual SOC compliance update",
    status: "pending",
    attachments: ["SOC_Request_XYZ_Inc.pdf"],
    isSOC: false,
  },
  {
    id: 3,
    customerId: 103,
    customerName: "123 Industries",
    requesterId: 203,
    requesterName: "Bob Johnson",
    requestDate: "2023-05-05",
    details: "SOC compliance for government contract",
    status: "approved",
    approvedDate: "2023-05-08",
    approverId: 301,
    approverName: "Admin User",
    attachments: ["SOC_Request_123_Industries.pdf"],
    isSOC: true,
    socDetails: {
      businessRegistrationNumber: "130-81-67890",
      investmentAmount: "1,200억 원",
      investmentPercentage: "3.5%",
      investmentDate: "2023-01-10",
      additionalInfo: "물류 인프라 SOC",
    },
  },
  {
    id: 4,
    customerId: 104,
    customerName: "456 Corp",
    requesterId: 204,
    requesterName: "Alice Brown",
    requestDate: "2023-05-01",
    details: "SOC compliance for financial audit",
    status: "rejected",
    rejectedDate: "2023-05-03",
    rejectorId: 301,
    rejectorName: "Admin User",
    rejectionReason: "Insufficient information provided",
    attachments: ["SOC_Request_456_Corp.pdf"],
    isSOC: false,
  },
]

// Mock data for SOC confirmations
export const socConfirmations: SOCConfirmation[] = [
  {
    id: 1,
    requestId: 3,
    customerId: 103,
    customerName: "123 Industries",
    confirmationDate: "2023-05-10",
    expiryDate: "2024-05-10",
    documentUrl: "/documents/soc/123_Industries_SOC.pdf",
  },
]

// Mock data for company contacts
export const companyContacts: CompanyContact[] = [
  {
    id: "cc1",
    name: "김철수",
    email: "kim.cs@samsung.com",
    position: "부장",
    company: "삼성전자",
    type: "company",
  },
  {
    id: "cc2",
    name: "이영희",
    email: "lee.yh@samsung.com",
    position: "과장",
    company: "삼성전자",
    type: "company",
  },
  {
    id: "cc3",
    name: "박지민",
    email: "park.jm@samsung.com",
    position: "대리",
    company: "삼성전자",
    type: "company",
  },
  {
    id: "cc4",
    name: "정민수",
    email: "jung.ms@hyundai.com",
    position: "차장",
    company: "현대건설",
    type: "company",
  },
]

// Mock data for Cushman contacts
export const cushmanContacts: CompanyContact[] = [
  {
    id: "cw1",
    name: "홍길동",
    email: "hong.gd@cushwake.com",
    position: "이사",
    company: "쿠시먼앤웨이크필드",
    type: "cushman",
  },
  {
    id: "cw2",
    name: "김영수",
    email: "kim.ys@cushwake.com",
    position: "부장",
    company: "쿠시먼앤웨이크필드",
    type: "cushman",
  },
  {
    id: "cw3",
    name: "이지은",
    email: "lee.je@cushwake.com",
    position: "과장",
    company: "쿠시먼앤웨이크필드",
    type: "cushman",
  },
]

// Function to search company by name or business registration number
export function searchCompany(query: string): any | null {
  if (!query) return null

  const normalizedQuery = query.toLowerCase().trim()

  return companyDatabase.find(
    (company) =>
      company.name.toLowerCase().includes(normalizedQuery) ||
      company.businessRegistrationNumber.includes(normalizedQuery),
  )
}

// Function to get company contacts by company name
export function getCompanyContacts(companyName: string): CompanyContact[] {
  return companyContacts.filter((contact) => contact.company.toLowerCase() === companyName.toLowerCase())
}

// Function to get all Cushman contacts
export function getCushmanContacts(): CompanyContact[] {
  return cushmanContacts
}

// Function to get SOC requests by status
export function getSOCRequestsByStatus(status: "pending" | "approved" | "rejected"): SOCRequest[] {
  return socRequests.filter((request) => request.status === status)
}

// Function to get SOC request by ID
export function getSOCRequestById(id: number): SOCRequest | undefined {
  return socRequests.find((request) => request.id === id)
}

// Function to get SOC confirmations by customer ID
export function getSOCConfirmationsByCustomerId(customerId: number): SOCConfirmation[] {
  return socConfirmations.filter((confirmation) => confirmation.customerId === customerId)
}

// Function to get all SOC confirmations
export function getAllSOCConfirmations(): SOCConfirmation[] {
  return socConfirmations
}
