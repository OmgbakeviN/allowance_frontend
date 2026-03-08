import { useEffect, useMemo, useState } from "react"
import { money } from "@/lib/format"
import { getStudentExpenses, getStudentExpenseSummary } from "@/features/expenses/expensesService"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  CalendarDays,
  CircleDollarSign,
  Filter,
  Receipt,
  Tag,
  TrendingUp,
  Wallet,
} from "lucide-react"

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
}

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#34E3CC]/20 via-[#4F9DFF]/20 to-[#7C5ADE]/20">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  )
}

function AlertsRow({ alerts = [] }) {
  if (!alerts.length) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        <span>No alerts</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((a, idx) => (
        <Badge key={idx} variant="secondary" className="gap-1 rounded-full px-3 py-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          {a.type}
        </Badge>
      ))}
    </div>
  )
}

function BucketBadge({ value }) {
  const styles = {
    DAILY: "bg-[#34E3CC]/10 text-[#0f766e] border-[#34E3CC]/30 dark:text-[#7ef3e0]",
    BILLS: "bg-[#4F9DFF]/10 text-[#1d4ed8] border-[#4F9DFF]/30 dark:text-[#93c5fd]",
    SAVINGS: "bg-[#7C5ADE]/10 text-[#6d28d9] border-[#7C5ADE]/30 dark:text-[#c4b5fd]",
  }

  return (
    <Badge variant="outline" className={`rounded-full ${styles[value] || ""}`}>
      {value}
    </Badge>
  )
}

export default function ParentStudentExpensesTab({ studentId, currency = "XAF" }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])

  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [bucketType, setBucketType] = useState("")

  const normalizedBucketType = bucketType === "__all__" ? "" : bucketType

  const params = useMemo(() => {
    const p = {}
    if (dateFrom) p.date_from = dateFrom
    if (dateTo) p.date_to = dateTo
    if (normalizedBucketType) p.bucket_type = normalizedBucketType
    return p
  }, [dateFrom, dateTo, normalizedBucketType])

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const [sum, list] = await Promise.all([
        getStudentExpenseSummary(studentId, {
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        }),
        getStudentExpenses(studentId, params),
      ])
      setSummary(sum)
      setExpenses(list || [])
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load expenses.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [studentId])

  const resetFilters = () => {
    setDateFrom("")
    setDateTo("")
    setBucketType("")
    setTimeout(() => load(), 0)
  }

  if (loading && !summary) return <Skeleton className="h-40 w-full rounded-2xl" />

  return (
    <div className="space-y-6">
      {error ? (
        <Alert className="rounded-2xl">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={CircleDollarSign}
          title="Total today"
          subtitle="Today’s spending"
          value={money(summary?.total_today, currency)}
        />
        <StatCard
          icon={TrendingUp}
          title="Total week"
          subtitle="This week"
          value={money(summary?.total_week, currency)}
        />
        <StatCard
          icon={Wallet}
          title="Total month"
          subtitle="This month"
          value={money(summary?.total_month, currency)}
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alerts
          </CardTitle>
          <CardDescription>Important signals for this student</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertsRow alerts={summary?.alerts || []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Top categories
            </CardTitle>
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
                    <TableCell className="font-medium">{c["category__name"]}</TableCell>
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter this student's expense history</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  Date from
                </Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  Date to
                </Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Bucket
              </Label>
              <Select value={bucketType} onValueChange={setBucketType}>
                <SelectTrigger className="rounded-xl">
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

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={load} className="gap-2 rounded-xl">
                <Filter className="h-4 w-4" />
                Apply
              </Button>
              <Button variant="outline" onClick={resetFilters} className="rounded-xl">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expenses list
          </CardTitle>
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
                  <TableCell className="font-medium">{e.category?.name}</TableCell>
                  <TableCell>
                    <BucketBadge value={e.bucket_type} />
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate">{e.note || "-"}</TableCell>
                  <TableCell className="text-right font-medium">{money(e.amount, currency)}</TableCell>
                  <TableCell className="text-right">
                    {e.receipt ? (
                      <a
                        className="inline-flex items-center gap-1 underline underline-offset-4"
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