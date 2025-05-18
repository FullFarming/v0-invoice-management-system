// 예시 데이터 - 실제 구현에서는 데이터베이스에서 가져옴

// 고객사 목록
export const customers = [
  { value: "customer-1", label: "ABC 회사" },
  { value: "customer-2", label: "XYZ 기업" },
  { value: "customer-3", label: "123 부동산" },
  { value: "customer-4", label: "대한 건설" },
  { value: "customer-5", label: "서울 디벨로퍼스" },
  { value: "customer-6", label: "글로벌 인베스트먼트" },
  { value: "customer-7", label: "한국 리테일" },
  { value: "customer-8", label: "스마트 오피스" },
  { value: "customer-9", label: "미래 자산" },
  { value: "customer-10", label: "부동산 파트너스" },
]

// 공급업체 목록
export const suppliers = [
  { value: "supplier-1", label: "가구 공급업체 A" },
  { value: "supplier-2", label: "인테리어 업체 B" },
  { value: "supplier-3", label: "청소 서비스 C" },
  { value: "supplier-4", label: "보안 시스템 D" },
  { value: "supplier-5", label: "시설 관리 E" },
  { value: "supplier-6", label: "전기 공사 F" },
  { value: "supplier-7", label: "네트워크 설치 G" },
  { value: "supplier-8", label: "조경 관리 H" },
  { value: "supplier-9", label: "광고 대행사 I" },
  { value: "supplier-10", label: "법률 자문 J" },
]

// 담당자 이메일 목록 - 부서별로 정리
export const managerEmails = [
  { value: "john.doe@company.com", label: "John Doe (TAG)" },
  { value: "jane.smith@company.com", label: "Jane Smith (Global Occupier Services)" },
  { value: "robert.johnson@company.com", label: "Robert Johnson (Office Leasing Marketing Advisory)" },
  { value: "emily.davis@company.com", label: "Emily Davis (Project & Development Services)" },
  { value: "michael.brown@company.com", label: "Michael Brown (Retail Strategy)" },
  { value: "sarah.wilson@company.com", label: "Sarah Wilson (Retail Consulting Group)" },
  { value: "david.miller@company.com", label: "David Miller (Retail Leasing Services)" },
  { value: "jennifer.taylor@company.com", label: "Jennifer Taylor (Retail Value Add Transaction)" },
  { value: "james.anderson@company.com", label: "James Anderson (Retail Logistics)" },
  { value: "lisa.thomas@company.com", label: "Lisa Thomas (Asset Service)" },
  { value: "kevin.martin@company.com", label: "Kevin Martin (Capital Markets)" },
  { value: "laura.white@company.com", label: "Laura White (Business Development Services)" },
  { value: "mark.lee@company.com", label: "Mark Lee (Finance)" },
  { value: "susan.clark@company.com", label: "Susan Clark (HR)" },
  { value: "paul.walker@company.com", label: "Paul Walker (WPR)" },
]

// 고객사 이메일 목록
export const customerEmails = [
  { value: "contact@abc.com", label: "ABC 회사 (대표 이메일)" },
  { value: "finance@abc.com", label: "ABC 회사 (재무팀)" },
  { value: "info@xyz.com", label: "XYZ 기업 (대표 이메일)" },
  { value: "accounting@xyz.com", label: "XYZ 기업 (회계팀)" },
  { value: "contact@123estate.com", label: "123 부동산 (대표 이메일)" },
  { value: "info@daehan.com", label: "대한 건설 (대표 이메일)" },
  { value: "contact@seoul-dev.com", label: "서울 디벨로퍼스 (대표 이메일)" },
  { value: "info@global-inv.com", label: "글로벌 인베스트먼트 (대표 이메일)" },
  { value: "contact@korea-retail.com", label: "한국 리테일 (대표 이메일)" },
  { value: "info@smart-office.com", label: "스마트 오피스 (대표 이메일)" },
]

// 벤더 목록 (고객사 + 공급업체 통합)
export const vendors = [
  ...customers.map((customer) => ({
    id: customer.value,
    name: customer.label,
    businessNumber: `123-${customer.value.split("-")[1]}-67890`,
    contactName: "담당자",
    contactEmail: `contact@${customer.label.toLowerCase().replace(/\s+/g, "")}.com`,
    contactPhone: "02-1234-5678",
    category: "고객사",
    lastTransaction: "2023-04-15",
  })),
  ...suppliers.map((supplier) => ({
    id: supplier.value,
    name: supplier.label,
    businessNumber: `234-${supplier.value.split("-")[1]}-78901`,
    contactName: "담당자",
    contactEmail: `contact@${supplier.label.toLowerCase().replace(/\s+/g, "")}.com`,
    contactPhone: "02-2345-6789",
    category: "공급업체",
    lastTransaction: "2023-05-20",
  })),
]
