import { useEffect, useState } from "react"
import { getTheme, setTheme } from "@/theme/theme"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ThemeToggle() {
  const [theme, setLocalTheme] = useState(getTheme())

  useEffect(() => {
    setLocalTheme(getTheme())
  }, [])

  const choose = (t) => {
    setLocalTheme(t)
    setTheme(t)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Theme: {theme}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => choose("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => choose("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => choose("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}