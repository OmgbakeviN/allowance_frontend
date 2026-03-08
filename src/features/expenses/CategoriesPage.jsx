import { useEffect, useState } from "react"

import { createCategory, getCategories } from "@/features/expenses/expensesService"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, FolderPlus, Sparkles, Tag } from "lucide-react"

export default function CategoriesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [creating, setCreating] = useState(false)
  const [info, setInfo] = useState("")

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getCategories()
      setRows(data || [])
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load categories.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    setInfo("")
    try {
      const res = await createCategory({ name: name.trim(), slug: slug.trim() })
      setInfo(`Created: ${res.name}`)
      setName("")
      setSlug("")
      await load()
    } catch (e2) {
      const d = e2?.response?.data
      setError(d?.name?.[0] || d?.slug?.[0] || d?.detail || "Failed to create category.")
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Tag className="h-5 w-5" />
            Categories
          </CardTitle>
          <CardDescription>Manage default and custom expense categories.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create category
          </CardTitle>
          <CardDescription>Add a custom category for your expenses.</CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert className="mb-4 rounded-2xl">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}

          {info ? (
            <Alert className="mb-4 rounded-2xl">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={onCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Snack"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                Slug
              </Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="snack"
                required
                className="rounded-xl"
              />
            </div>

            <Button type="submit" disabled={creating} className="gap-2 rounded-xl">
              <FolderPlus className="h-4 w-4" />
              {creating ? "..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categories list
          </CardTitle>
          <CardDescription>All available categories</CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.slug}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${
                        r.is_default
                          ? "border-[#4F9DFF]/30 bg-[#4F9DFF]/10 text-[#1d4ed8] dark:text-[#93c5fd]"
                          : "border-[#7C5ADE]/30 bg-[#7C5ADE]/10 text-[#6d28d9] dark:text-[#c4b5fd]"
                      }`}
                    >
                      {r.is_default ? "Default" : "Custom"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No categories.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}