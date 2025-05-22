"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { FileText, Package, Search, LogOut, Inbox, FileCheck } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

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
      label: "Invoice Request",
      icon: <FileText className="mr-2 h-4 w-4" />,
      dropdown: true,
      active: pathname.includes("/invoices"),
      items: [
        {
          href: "/invoices/customer/new",
          label: "Customer Invoice",
          active: pathname === "/invoices/customer/new",
          icon: <FileText className="mr-2 h-4 w-4" />,
        },
        {
          href: "/invoices/supplier/new",
          label: "Supplier Invoice",
          active: pathname === "/invoices/supplier/new",
          icon: <Package className="mr-2 h-4 w-4" />,
        },
      ],
    },
    {
      href: "/soc",
      label: "SOC",
      active: pathname.includes("/soc"),
      icon: <FileCheck className="mr-2 h-4 w-4" />,
    },
    {
      href: "/vendors/search",
      label: "Search Vendors",
      active: pathname === "/vendors/search",
      icon: <Search className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 py-3 px-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/dashboard" className="flex items-center mr-4">
            <Image
              src="/images/CW_Logo_Color.png"
              alt="Cushman & Wakefield Logo"
              width={120}
              height={30}
              className="h-8 w-auto"
            />
          </Link>

          <nav className="flex items-center space-x-4 lg:space-x-6">
            {routes.map((route, index) =>
              route.dropdown ? (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger className="flex items-center text-sm font-medium transition-colors hover:text-primary focus:outline-none">
                    <span className={cn("flex items-center", route.active ? "text-primary" : "text-muted-foreground")}>
                      {route.icon}
                      {route.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {route.items?.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex w-full items-center text-sm",
                            item.active ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
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
              ),
            )}
          </nav>
        </div>

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
    </div>
  )
}
