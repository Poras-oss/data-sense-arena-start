import React from 'react'
import { LayoutGrid, Code2, Trophy, Shield, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from '@/lib/theme-context'

const navItems = [
  { icon: LayoutGrid, label: 'Dashboard', className: 'bg-rose-100 text-rose-900' },
  { icon: Code2, label: 'Challenges' },
  { icon: Trophy, label: 'Leaderboards' },
  { icon: Shield, label: 'Badges and Achievements' },
  { icon: Users, label: 'Community' },
]

export function Sidebar() {
  const { theme } = useTheme()

  return (
    <aside className={`w-[72px] ${theme === 'dark' ? 'bg-[#1a1d1e] border-[#2a2d2e]' : 'bg-white border-gray-200'} border-r hidden md:block`}>
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-2 py-4">
          {navItems.map((item, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#2a2d2e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} ${item.className || ''}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  )
}