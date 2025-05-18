import Image from "next/image"
import Link from "next/link"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={className}>
      <Image
        src="/images/CW_Logo_Color.png"
        alt="Cushman & Wakefield"
        width={120}
        height={33}
        priority
        className="h-auto w-auto"
      />
    </Link>
  )
}
