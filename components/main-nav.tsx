"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { FileText, Package, Search, LogOut, Inbox, Users } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const { logout, isOwner } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      label: "Main",
      active: pathname === "/dashboard",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      href: "/invoices/customer/new",
      label: "Customer Invoice",
      active: pathname === "/invoices/customer/new",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      href: "/invoices/supplier/new",
      label: "3rd party Invoice",
      active: pathname === "/invoices/supplier/new",
      icon: <Package className="mr-2 h-4 w-4" />,
    },
    {
      href: "/vendors/search",
      label: "Search Vendors",
      active: pathname === "/vendors/search",
      icon: <Search className="mr-2 h-4 w-4" />,
    },
    {
      href: "/plus-one/new",
      label: "Plus One",
      active: pathname === "/plus-one/new",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <div className="flex w-full items-center justify-between">
      <nav className="flex items-center space-x-4 lg:space-x-6">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {route.icon}
            {route.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center space-x-4">
        <Link
          href="/inbox"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/inbox" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Inbox className="mr-2 h-4 w-4" />
          Inbox
        </Link>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  )
}
