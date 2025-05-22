import type { ReactNode } from "react"
import { MainNav } from "@/components/main-nav"

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardLayoutComponent({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="pt-16 pb-10">
        <div className="container mx-auto px-4">{children}</div>
      </div>
    </div>
  )
}

// 명명된 내보내기 추가
export { DashboardLayoutComponent as DashboardLayout }

// 기본 내보내기 유지
export default DashboardLayoutComponent
