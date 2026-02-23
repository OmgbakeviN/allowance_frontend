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

  if (loading) return <Skeleton className="h-40 w-full" />

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Default + your custom categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert className="mb-3">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}

          {info ? (
            <Alert className="mb-3">
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={onCreate} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Snack" required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="snack" required />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? "..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>List</CardTitle>
          <CardDescription>All categories available</CardDescription>
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
                    <Badge variant={r.is_default ? "secondary" : "default"}>
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