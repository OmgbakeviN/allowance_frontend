import { useEffect, useMemo, useState } from "react"

import { getMyExpenseSummary, getMyExpenses, getCategories } from "@/features/expenses/expensesService"
import ExpenseCreateDialog from "@/features/expenses/ExpenseCreateDialog"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
}

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currency, setCurrency] = useState("XAF")

  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])

  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [bucketType, setBucketType] = useState("")

  const params = useMemo(() => {
    const p = {}
    if (dateFrom) p.date_from = dateFrom
    if (dateTo) p.date_to = dateTo
    if (categoryId) p.category_id = categoryId
    if (bucketType) p.bucket_type = bucketType
    return p
  }, [dateFrom, dateTo, categoryId, bucketType])

  const loadAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [cats, sum, list] = await Promise.all([
        getCategories(),
        getMyExpenseSummary({ date_from: dateFrom || undefined, date_to: dateTo || undefined }),
        getMyExpenses(params),
      ])
      setCategories(cats || [])
      setSummary(sum)
      setExpenses(list || [])

      const cur =
        sum?.wallet?.currency ||
        list?.[0]?.wallet?.currency ||
        "XAF"
      setCurrency(cur)
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load expenses.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const applyFilters = async () => {
    setLoading(true)
    setError("")
    try {
      const [sum, list] = await Promise.all([
        getMyExpenseSummary({ date_from: dateFrom || undefined, date_to: dateTo || undefined }),
        getMyExpenses(params),
      ])
      setSummary(sum)
      setExpenses(list || [])
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to apply filters.")
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setDateFrom("")
    setDateTo("")
    setCategoryId("")
    setBucketType("")
    setTimeout(() => loadAll(), 0)
  }

  if (loading && !summary) return <Skeleton className="h-40 w-full" />

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Track spending with categories and alerts.</CardDescription>
          </div>
          <ExpenseCreateDialog onCreated={loadAll} />
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert className="mb-3">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">Total today</div>
              <div className="text-xl font-semibold">{money(summary?.total_today, currency)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">Total week</div>
              <div className="text-xl font-semibold">{money(summary?.total_week, currency)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">Total month</div>
              <div className="text-xl font-semibold">{money(summary?.total_month, currency)}</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm font-medium mb-2">Alerts</div>
            <div className="flex flex-wrap gap-2">
              {(summary?.alerts || []).length ? (
                summary.alerts.map((a, idx) => (
                  <Badge key={idx} variant="secondary">
                    {a.type}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No alerts</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
            <CardDescription>Top 5 by total amount</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summary?.top_categories || []).map((c, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{c["category__name"]}</TableCell>
                    <TableCell className="text-right">{money(c.total, currency)}</TableCell>
                  </TableRow>
                ))}
                {(!summary?.top_categories || summary.top_categories.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      No data yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter list by period/category/bucket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date from</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date to</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bucket</Label>
                <Select value={bucketType} onValueChange={setBucketType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All buckets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    <SelectItem value="DAILY">DAILY</SelectItem>
                    <SelectItem value="BILLS">BILLS</SelectItem>
                    <SelectItem value="SAVINGS">SAVINGS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  if (categoryId === "__all__") setCategoryId("")
                  if (bucketType === "__all__") setBucketType("")
                  setTimeout(() => applyFilters(), 0)
                }}
                variant="secondary"
              >
                Apply
              </Button>
              <Button onClick={resetFilters} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses list</CardTitle>
          <CardDescription>Latest expenses</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Bucket</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-muted-foreground">{fmt(e.occurred_at)}</TableCell>
                  <TableCell>{e.category?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.bucket_type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate">{e.note || "-"}</TableCell>
                  <TableCell className="text-right font-medium">{money(e.amount, currency)}</TableCell>
                  <TableCell className="text-right">
                    {e.receipt ? (
                      <a
                        className="underline underline-offset-4"
                        href={e.receipt}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No expenses yet.
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