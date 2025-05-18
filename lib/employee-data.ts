// 직원 데이터 인터페이스
export interface Employee {
  name: string
  koreanName?: string
  email: string
  position: string
  department: string
  level: number // 직급 레벨 (승인 권한 순위에 사용)
}

// 직급별 레벨 매핑 (높은 숫자 = 높은 직급)
const positionLevels: Record<string, number> = {
  "Managing Director": 10,
  "Deputy Managing Director": 9,
  "Senior Executive Director": 9,
  "Executive Director": 8,
  "Senior Director": 7,
  Director: 6,
  "Associate Director": 5,
  "Senior Project Manager": 4,
  "Senior Manager": 4,
  Manager: 3,
  "Project Manager": 3,
  "Assistant Manager": 2,
  "Assistant Project Manager": 2,
  Agent: 1,
  Consultant: 1,
  Assistant: 1,
  "Admin Assistant": 1,
  Designer: 1,
  "Marketing Associate": 1,
  Receptionist: 1,
  Driver: 1,
}

// 직급 레벨 가져오기 함수
const getPositionLevel = (position: string): number => {
  // 괄호 안의 내용 제거 (예: "Director (이사)" -> "Director")
  const basePosition = position.split("(")[0].trim()

  // 매핑된 레벨 반환, 없으면 기본값 1
  return positionLevels[basePosition] || 1
}

// 직원 데이터
export const employees: Employee[] = [
  // Managing Director
  {
    name: "Richard Hwang",
    koreanName: "황점상",
    email: "richard.hwang@ap.cushwake.com",
    position: "Managing Director Korea",
    department: "Managing Director",
    level: getPositionLevel("Managing Director"),
  },

  // Occupier Service
  {
    name: "YJ Choi",
    koreanName: "최용준",
    email: "yj.choi@ap.cushwake.com",
    position: "Executive Director (선임 상무)",
    department: "Occupier Service",
    level: getPositionLevel("Executive Director"),
  },

  // TAG (Tenant Advisory Group)
  {
    name: "John Pritchard",
    koreanName: "John Pritchard",
    email: "john.pritchard@cushwake.com",
    position: "Senior Director (상무)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Senior Director"),
  },
  {
    name: "Stacy Lee",
    koreanName: "이수정",
    email: "Stacy.Lee@cushwake.com",
    position: "Director (이사)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Director"),
  },
  {
    name: "Kelly Youn",
    koreanName: "윤주희",
    email: "kelly.youn@ap.cushwake.com",
    position: "Associate Director (이사대우)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Associate Director"),
  },
  {
    name: "Colin Choi",
    koreanName: "최영주",
    email: "colin.choi@cushwake.com",
    position: "Associate Director (이사대우)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Associate Director"),
  },
  {
    name: "Erin Lee",
    koreanName: "이수진",
    email: "Erin.Lee@cushwake.com",
    position: "Associate Director (이사대우)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Associate Director"),
  },
  {
    name: "Danny Park",
    koreanName: "박태민",
    email: "danny.park@cushwake.com",
    position: "Senior Manager (부장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Haley Lee",
    koreanName: "이휘경",
    email: "haley.lee@cushwake.com",
    position: "Senior Manager (부장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Joe Kim",
    koreanName: "김영조",
    email: "Joe.Kim1@cushwake.com",
    position: "Senior Manager (부장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Ethan Lee",
    koreanName: "이원형",
    email: "ethan.lee@cushwake.com",
    position: "Senior Manager (부장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Jane Choi",
    koreanName: "최희경",
    email: "jane.choi@cushwake.com",
    position: "Senior Manager (차장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Lloyd Jang",
    koreanName: "장백상",
    email: "lloyd.jang@cushwake.com",
    position: "Senior Manager (차장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Sydney Chun",
    koreanName: "전혜원",
    email: "Sydney.Chun@cushwake.com",
    position: "Senior Manager (차장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Henry Kwon",
    koreanName: "권형민",
    email: "Henry.Kwon@cushwake.com",
    position: "Senior Manager (차장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Soyeon Lee",
    koreanName: "이소연",
    email: "soyeon.lee@cushwake.com",
    position: "Manager (과장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Manager"),
  },
  {
    name: "Jina Lim",
    koreanName: "임지나",
    email: "jina.lim@cushwake.com",
    position: "Manager (과장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Manager"),
  },
  {
    name: "Miji Kyung",
    koreanName: "경미지",
    email: "miji.kyung@cushwake.com",
    position: "Manager (과장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Manager"),
  },
  {
    name: "Sienna Ahn",
    koreanName: "안세연",
    email: "sienna.ahn@cushwake.com",
    position: "Manager (과장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Manager"),
  },
  {
    name: "Leadley Park",
    koreanName: "박병선",
    email: "Leadley.Park@cushwake.com",
    position: "Manager (과장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Manager"),
  },
  {
    name: "Julie Yeum",
    koreanName: "염수민",
    email: "Julie.Yeum@cushwake.com",
    position: "Manager (과장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Manager"),
  },
  {
    name: "Noah Kim",
    koreanName: "김효겸",
    email: "noah.kim@cushwake.com",
    position: "Manager (과장)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Manager"),
  },
  {
    name: "Jaein Kim",
    koreanName: "김재인",
    email: "jaein.kim@cushwake.com",
    position: "Assistant Manager (대리)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Assistant Manager"),
  },
  {
    name: "Jaena Shim",
    koreanName: "심재나",
    email: "jaena.shim@cushwake.com",
    position: "Assistant Manager (대리)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Assistant Manager"),
  },
  {
    name: "Chan Joung",
    koreanName: "정찬영",
    email: "Chan.joung@cushwake.com",
    position: "Assistant Manager (대리)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Assistant Manager"),
  },
  {
    name: "Naomi Bae",
    koreanName: "배나은",
    email: "Naomi.Bae@cushwake.com",
    position: "Assistant (인턴)",
    department: "TAG (Tenant Advisory Group)",
    level: getPositionLevel("Assistant"),
  },

  // Global Occupier Services
  {
    name: "Ryan Lee",
    koreanName: "이창준",
    email: "ryan.lee@ap.cushwake.com",
    position: "Executive Director (전무)",
    department: "Global Occupier Services",
    level: getPositionLevel("Executive Director"),
  },
  {
    name: "Stella Park",
    koreanName: "박휘진",
    email: "stella.park1@cushwake.com",
    position: "Senior Manager (차장)",
    department: "Global Occupier Services",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Yoonji Sung",
    koreanName: "성윤지",
    email: "yoonji.sung@cushwake.com",
    position: "Admin Assistant (사원)",
    department: "Global Occupier Services",
    level: getPositionLevel("Admin Assistant"),
  },

  // Leasing Marketing Advisory
  {
    name: "Jay Hyun",
    koreanName: "현해진",
    email: "jay.hyun@ap.cushwake.com",
    position: "Director (이사)",
    department: "Leasing Marketing Advisory",
    level: getPositionLevel("Director"),
  },
  {
    name: "Ray Kim",
    koreanName: "김성철",
    email: "ray.kim@cushwake.com",
    position: "Director (이사)",
    department: "Leasing Marketing Advisory",
    level: getPositionLevel("Director"),
  },
  {
    name: "Jin An",
    koreanName: "안성진",
    email: "jin.an@cushwake.com",
    position: "Senior Manager (부장)",
    department: "Leasing Marketing Advisory",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Roy Park",
    koreanName: "박윤호",
    email: "roy.park@cushwake.com",
    position: "Senior Manager (부장)",
    department: "Leasing Marketing Advisory",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Beomjin Kim",
    koreanName: "김범진",
    email: "beomjin.kim@cushwake.com",
    position: "Senior Manager (부장)",
    department: "Leasing Marketing Advisory",
    level: getPositionLevel("Senior Manager"),
  },
  {
    name: "Jayden Yoo",
    koreanName: "유주형",
    email: "jayden.yoo@cushwake.com",
    position: "Manager (과장)",
    department: "Leasing Marketing Advisory",
    level: getPositionLevel("Manager"),
  },
  {
    name: "Zoe Kim",
    koreanName: "김하람",
    email: "zoe.kim@cushwake.com",
    position: "Manager (과장)",
    department: "Leasing Marketing Advisory",
    level: getPositionLevel("Manager"),
  },
  {
    name: "Jun Kho",
    koreanName: "고준원",
    email: "jun.kho@cushwake.com",
    position: "Assistant Manager (대리)",
    department: "Leasing Marketing Advisory",
    level: getPositionLevel("Assistant Manager"),
  },
  {
    name: "Jae Kim",
    koreanName: "김희재",
    email: "Jae.kim@cushwake.com",
    position: "Agent (사원)",
    department: "Leasing Marketing Advisory",
    level: getPositionLevel("Agent"),
  },

  // Project & Development Services
  {
    name: "Jaehong Lee",
    koreanName: "이재홍",
    email: "jaehong.lee@cushwake.com",
    position: "Senior Director (상무)",
    department: "Project & Development Services",
    level: getPositionLevel("Senior Director"),
  },
  {
    name: "Christine Park",
    koreanName: "박주연",
    email: "Christine.Park@cushwake.com",
    position: "Director (이사)",
    department: "Project & Development Services",
    level: getPositionLevel("Director"),
  },
  {
    name: "Daniel Moon",
    koreanName: "문동현",
    email: "daniel.moon@cushwake.com",
    position: "Director (이사)",
    department: "Project & Development Services",
    level: getPositionLevel("Director"),
  },
  {
    name: "JS Lee",
    koreanName: "이종석",
    email: "js.lee@cushwake.com",
    position: "Associate Director (이사대우)",
    department: "Project & Development Services",
    level: getPositionLevel("Associate Director"),
  },
  {
    name: "Haejun Lee",
    koreanName: "이해준",
    email: "Haejun.Lee@cushwake.com",
    position: "Associate Director (이사대우)",
    department: "Project & Development Services",
    level: getPositionLevel("Associate Director"),
  },

  // 나머지 부서 직원들도 동일한 형식으로 추가...
  // 여기서는 일부만 포함했으며, 실제 구현 시 전체 직원 데이터를 추가해야 합니다.

  // Retail & Logistics Services
  {
    name: "Dan Kim",
    koreanName: "김성순",
    email: "dan.kim@ap.cushwake.com",
    position: "Deputy Managing Director (부대표)",
    department: "Retail & Logistics Services",
    level: getPositionLevel("Deputy Managing Director"),
  },

  // Finance
  {
    name: "Helen Lee",
    koreanName: "이태경",
    email: "helen.lee@ap.cushwake.com",
    position: "Finance Director (상무)",
    department: "Finance",
    level: getPositionLevel("Director"),
  },

  // HR
  {
    name: "Jennifer Roh",
    koreanName: "노임연",
    email: "jennifer.roh@cushwake.com",
    position: "Director (이사)",
    department: "HR (인사)",
    level: getPositionLevel("Director"),
  },
]

// 부서 목록 가져오기
export const getDepartments = (): string[] => {
  const departments = new Set<string>()
  employees.forEach((employee) => departments.add(employee.department))
  return Array.from(departments).sort()
}

// 직급 목록 가져오기
export const getPositions = (): string[] => {
  const positions = new Set<string>()
  employees.forEach((employee) => {
    // 괄호 안의 내용 제거 (예: "Director (이사)" -> "Director")
    const basePosition = employee.position.split("(")[0].trim()
    positions.add(basePosition)
  })
  return Array.from(positions).sort((a, b) => (positionLevels[b] || 0) - (positionLevels[a] || 0))
}

// 이메일 검색 함수
export const searchEmployeesByEmail = (query: string): Employee[] => {
  if (!query) return []
  const lowerQuery = query.toLowerCase()
  return employees.filter((employee) => employee.email.toLowerCase().includes(lowerQuery))
}

// 이름 검색 함수
export const searchEmployeesByName = (query: string): Employee[] => {
  if (!query) return []
  const lowerQuery = query.toLowerCase()
  return employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(lowerQuery) || (employee.koreanName && employee.koreanName.includes(query)),
  )
}

// 부서별 직원 검색 함수
export const getEmployeesByDepartment = (department: string): Employee[] => {
  return employees.filter((employee) => employee.department === department)
}

// 직급별 직원 검색 함수
export const getEmployeesByPosition = (position: string): Employee[] => {
  return employees.filter((employee) => employee.position.includes(position))
}

// 승인권자 추천 함수 (직급 기준)
export const getSuggestedApprovers = (employeeEmail: string, count = 3): Employee[] => {
  // 현재 직원 찾기
  const currentEmployee = employees.find((emp) => emp.email === employeeEmail)
  if (!currentEmployee) return []

  // 현재 직원보다 높은 직급의 직원들 찾기
  const higherLevelEmployees = employees.filter(
    (emp) => emp.level > currentEmployee.level && emp.department === currentEmployee.department,
  )

  // 직급 순으로 정렬
  higherLevelEmployees.sort((a, b) => a.level - b.level)

  // 추천 승인권자 반환 (최대 count명)
  return higherLevelEmployees.slice(0, count)
}

// 이메일 옵션 형식으로 변환 (AutoComplete 컴포넌트용)
export const getEmployeeEmailOptions = (): { value: string; label: string }[] => {
  return employees.map((employee) => ({
    value: employee.email,
    label: `${employee.name} (${employee.department})`,
  }))
}

// 승인권자 옵션 형식으로 변환 (AutoComplete 컴포넌트용)
export const getApproverOptions = (): { value: string; label: string }[] => {
  // 관리자급 이상만 필터링 (레벨 5 이상: Associate Director 이상)
  const approvers = employees.filter((emp) => emp.level >= 5)

  return approvers.map((employee) => ({
    value: employee.email,
    label: `${employee.name} (${employee.position}) - ${employee.department}`,
  }))
}
