import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getParentOverview } from "@/features/dashboard/dashboardService"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

function BucketRow({ item, currency }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-muted-foreground">{item.bucket_type}</div>
      <div className="font-medium">{money(item.total, currency)}</div>
    </div>
  )
}

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

export default function ParentOverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const res = await getParentOverview()
        if (mounted) setData(res)
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load parent dashboard.")
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
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parent Dashboard</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const currency = data?.students?.[0]?.wallet?.currency || "XAF"

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Parent Dashboard</CardTitle>
          <CardDescription>
            Period: {data?.period?.month_start} → {data?.period?.today}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Total sent this month</div>
            <div className="text-2xl font-semibold">{money(data?.total_sent_this_month, currency)}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(data?.students || []).map((s) => (
          <Card key={s.student.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="truncate">{s.student.username}</span>
                <Badge variant="outline">{money(s.sent_this_month, currency)}</Badge>
              </CardTitle>
              <CardDescription className="truncate">{s.student.email}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">DAILY</div>
                  <div className="font-semibold">{money(s.wallet?.buckets?.DAILY, currency)}</div>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">SAVINGS</div>
                  <div className="font-semibold">{money(s.wallet?.buckets?.SAVINGS, currency)}</div>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">BILLS</div>
                  <div className="font-semibold">{money(s.wallet?.buckets?.BILLS, currency)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Repartition this month</div>
                <div className="space-y-1">
                  {(s.repartition_this_month || []).length ? (
                    s.repartition_this_month.map((r, idx) => (
                      <BucketRow key={idx} item={r} currency={currency} />
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No deposits yet.</div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Alerts</div>
                <Alerts alerts={s.alerts} />
              </div>
            </CardContent>

            <div className="p-4 pt-0">
              <Button asChild className="w-full" variant="secondary">
                <Link to={`/app/parent/students/${s.student.id}`}>View student</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}