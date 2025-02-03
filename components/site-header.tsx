import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-4 md:gap-8 mx-auto">
          <Link href="/" className="font-bold text-lg md:text-xl text-orange-500">
            Delika
          </Link>
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm lg:text-base">Product</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[300px] md:w-[400px] p-4">
                    <NavigationMenuLink asChild>
                      <Link href="/about" className="block space-y-3 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                        <h4 className="text-sm font-medium leading-none">About Us</h4>
                        <p className="text-sm text-muted-foreground">
                          Learn about our mission and vision.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm lg:text-base">Solutions</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[300px] md:w-[400px] p-4">
                    <NavigationMenuLink asChild>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium leading-none">Solutions</h4>
                        <p className="text-sm text-muted-foreground">Discover how we can help your business.</p>
                      </div>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/restaurants" legacyBehavior passHref>
                  <NavigationMenuLink className="text-sm lg:text-base px-4 py-2">
                    Restaurants
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/couriers" legacyBehavior passHref>
                  <NavigationMenuLink className="text-sm lg:text-base px-4 py-2">
                    Couriers
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  )
}

