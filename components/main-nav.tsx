"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Beaker } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                "text-sm font-medium transition-colors hover:text-orange-600",
                pathname === "/" ? "text-orange-600" : "text-gray-600"
              )}
            >
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/beta-testers" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                "text-sm font-medium transition-colors hover:text-orange-600 flex items-center gap-1",
                pathname === "/beta-testers" ? "text-orange-600" : "text-gray-600"
              )}
            >
              <Beaker className="w-4 h-4" />
              Beta Testers
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/become-courier" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                "text-sm font-medium transition-colors hover:text-orange-600",
                pathname === "/become-courier" ? "text-orange-600" : "text-gray-600"
              )}
            >
              Become a Courier
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
} 