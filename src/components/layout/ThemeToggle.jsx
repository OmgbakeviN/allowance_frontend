import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { getTheme, setTheme } from "@/theme/theme"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themeMap = {
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
  system: { label: "System", icon: Monitor },
}

export default function ThemeToggle() {
  const [theme, setLocalTheme] = useState(getTheme())

  useEffect(() => {
    setLocalTheme(getTheme())
  }, [])

  const choose = (value) => {
    setLocalTheme(value)
    setTheme(value)
  }

  const CurrentIcon = themeMap[theme]?.icon || Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        {Object.entries(themeMap).map(([value, item]) => {
          const Icon = item.icon

          return (
            <DropdownMenuItem
              key={value}
              onClick={() => choose(value)}
              className="cursor-pointer gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {theme === value ? (
                <span className="ml-auto h-2 w-2 rounded-full bg-gradient-to-r from-[#34E3CC] via-[#4F9DFF] to-[#7C5ADE]" />
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}