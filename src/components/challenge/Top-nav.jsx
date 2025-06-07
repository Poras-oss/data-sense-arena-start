import React from 'react'
import { Bell, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from '@/lib/theme-context'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react'
import RenderSubscription from '../RenderSubscription'  // Import the RenderSubscription component

export function TopNav() {
  const { theme } = useTheme()
  
  return (
    <nav className={`flex items-center justify-between px-4 md:px-8 py-4 ${theme === 'dark' ? 'bg-[#1a1d1e] border-[#2a2d2e]' : 'bg-white border-gray-200'} border-b`}>
      <div className="flex items-center gap-4 md:gap-6">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Datasense Battleground</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Integrated RenderSubscription component */}
        <RenderSubscription />
        
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" size="icon">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  )
}