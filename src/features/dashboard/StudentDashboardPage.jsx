import { useEffect, useState } from "react"
import { getStudentDashboard } from "@/features/dashboard/dashboardService"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  CircleDollarSign,
  Flame,
  PiggyBank,
  Receipt,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react"

function Alerts({ alerts = [] }) {
  if (!alerts?.length) {
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

function StatCard({ icon: Icon, title, description, value }) {
  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
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

export default function StudentDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const res = await getStudentDashboard()
        if (mounted) setData(res)
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load student dashboard.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const currency = data?.wallet?.currency || "XAF"
  const daily = data.wallet?.buckets?.DAILY
  const spentToday = data.spending?.spent_today
  const remainingToday = data.spending?.daily_remaining_today
  const recommended = data.projection?.recommended_daily_spend

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Student Dashboard</CardTitle>
            <CardDescription>Your daily budget at a glance</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {currency}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Wallet}
          title="Daily balance"
          description="Available in DAILY"
          value={money(daily, currency)}
        />

        <StatCard
          icon={Receipt}
          title="Spent today"
          description="Used from DAILY"
          value={money(spentToday, currency)}
        />

        <StatCard
          icon={CircleDollarSign}
          title="Remaining today"
          description="What is left for today"
          value={remainingToday ? money(remainingToday, currency) : "-"}
        />

        <StatCard
          icon={Target}
          title="Recommended / day"
          description="To finish the month well"
          value={money(recommended, currency)}
        />

        <StatCard
          icon={TrendingUp}
          title="Avg daily spend"
          description="Last 7 days"
          value={money(data.projection?.avg_daily_spend_7d, currency)}
        />

        <StatCard
          icon={Flame}
          title="Days until empty"
          description="Estimated DAILY duration"
          value={data.projection?.estimated_days_until_daily_empty ?? "-"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Top categories
              </CardTitle>
              <CardDescription>Highest expense categories</CardDescription>
            </div>
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
                {(data.top_categories || []).map((c, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{c["category__name"]}</TableCell>
                    <TableCell className="text-right">{money(c.total, currency)}</TableCell>
                  </TableRow>
                ))}
                {(!data.top_categories || data.top_categories.length === 0) && (
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
              <AlertTriangle className="h-5 w-5" />
              Alerts
            </CardTitle>
            <CardDescription>Important budget notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Alerts alerts={data.alerts} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}