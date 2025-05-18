import { redirect } from "next/navigation"

export default function Home() {
  // 홈 페이지에서 대시보드로 리디렉션
  redirect("/dashboard")

  return null
}
