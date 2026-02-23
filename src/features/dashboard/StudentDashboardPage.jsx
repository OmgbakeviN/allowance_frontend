import { useEffect, useState } from "react"
import { getStudentDashboard } from "@/features/dashboard/dashboardService"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

function Alerts({ alerts = [] }) {
  if (!alerts?.length) return <div className="text-sm text-muted-foreground">No alerts</div>
  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((a, idx) => (
        <Badge key={idx} variant="secondary">
          {a.type}
        </Badge>
      ))}
    </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription>Key stats & projection</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Daily balance</CardTitle>
            <CardDescription>DAILY bucket</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{money(daily, currency)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spent today</CardTitle>
            <CardDescription>From DAILY</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{money(spentToday, currency)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Remaining today</CardTitle>
            <CardDescription>Daily limit</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {remainingToday ? money(remainingToday, currency) : "-"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended / day</CardTitle>
            <CardDescription>To finish the month</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{money(recommended, currency)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg daily spend (7d)</CardTitle>
            <CardDescription>Burn rate</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{money(data.projection?.avg_daily_spend_7d, currency)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Est. days until empty</CardTitle>
            <CardDescription>DAILY bucket</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {data.projection?.estimated_days_until_daily_empty ?? "-"}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
            <CardDescription>By total amount</CardDescription>
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
                    <TableCell>{c["category__name"]}</TableCell>
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

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Alerts alerts={data.alerts} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}