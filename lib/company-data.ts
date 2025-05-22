export interface Company {
  id: string
  name: string
  businessNumber: string
  contactEmail: string
  companyEmail: string
  address: string
  type: "customer" | "supplier"
}

// Sample customer data
export const customers: Company[] = [
  {
    id: "1",
    name: "한국 리테일",
    businessNumber: "123-45-67890",
    contactEmail: "contact@korea-retail.com",
    companyEmail: "info@korea-retail.com",
    address: "서울특별시 강남구 테헤란로 123",
    type: "customer",
  },
  {
    id: "2",
    name: "ABC 회사",
    businessNumber: "234-56-78901",
    contactEmail: "contact@abc-company.com",
    companyEmail: "info@abc-company.com",
    address: "서울특별시 서초구 서초대로 456",
    type: "customer",
  },
  {
    id: "3",
    name: "XYZ 기업",
    businessNumber: "345-67-89012",
    contactEmail: "contact@xyz-corp.com",
    companyEmail: "info@xyz-corp.com",
    address: "서울특별시 송파구 올림픽로 789",
    type: "customer",
  },
  {
    id: "4",
    name: "123 부동산",
    businessNumber: "456-78-90123",
    contactEmail: "contact@123-realestate.com",
    companyEmail: "info@123-realestate.com",
    address: "서울특별시 마포구 마포대로 101",
    type: "customer",
  },
  {
    id: "5",
    name: "대한 건설",
    businessNumber: "567-89-01234",
    contactEmail: "contact@daehan-construction.com",
    companyEmail: "info@daehan-construction.com",
    address: "서울특별시 영등포구 여의대로 202",
    type: "customer",
  },
]

// Sample supplier data
export const suppliers: Company[] = [
  {
    id: "101",
    name: "서울 디벨로퍼스",
    businessNumber: "111-22-33333",
    contactEmail: "contact@seoul-developers.com",
    companyEmail: "info@seoul-developers.com",
    address: "서울특별시 중구 세종대로 100",
    type: "supplier",
  },
  {
    id: "102",
    name: "글로벌 인베스트먼트",
    businessNumber: "222-33-44444",
    contactEmail: "contact@global-investment.com",
    companyEmail: "info@global-investment.com",
    address: "서울특별시 종로구 종로 200",
    type: "supplier",
  },
  {
    id: "103",
    name: "스마트 오피스",
    businessNumber: "333-44-55555",
    contactEmail: "contact@smart-office.com",
    companyEmail: "info@smart-office.com",
    address: "서울특별시 용산구 이태원로 300",
    type: "supplier",
  },
]

// Get all companies
export const getAllCompanies = (): Company[] => {
  return [...customers, ...suppliers]
}

// Get companies by type
export const getCompaniesByType = (type: "customer" | "supplier"): Company[] => {
  return type === "customer" ? customers : suppliers
}

// Get company by ID
export const getCompanyById = (id: string): Company | undefined => {
  return getAllCompanies().find((company) => company.id === id)
}

// Get company by name
export const getCompanyByName = (name: string): Company | undefined => {
  return getAllCompanies().find((company) => company.name === name)
}
