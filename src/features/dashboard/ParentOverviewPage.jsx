import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getParentOverview } from "@/features/dashboard/dashboardService"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  ArrowRight,
  Landmark,
  Mail,
  PiggyBank,
  Receipt,
  User,
  Wallet,
} from "lucide-react"

function BucketRow({ item, currency }) {
  const iconMap = {
    DAILY: Wallet,
    SAVINGS: PiggyBank,
    BILLS: Receipt,
  }

  const Icon = iconMap[item.bucket_type] || Wallet

  return (
    <div className="flex items-center justify-between rounded-xl border p-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{item.bucket_type}</span>
      </div>
      <div className="font-medium">{money(item.total, currency)}</div>
    </div>
  )
}

function Alerts({ alerts = [] }) {
  if (!alerts?.length) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
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
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Parent Dashboard</CardTitle>
            <CardDescription>
              Period: {data?.period?.month_start} → {data?.period?.today}
            </CardDescription>
          </div>

          <div className="rounded-2xl bg-background/80 px-4 py-3 shadow-sm backdrop-blur">
            <div className="text-xs text-muted-foreground">Total sent this month</div>
            <div className="mt-1 text-2xl font-semibold">
              {money(data?.total_sent_this_month, currency)}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data?.students || []).map((s) => (
          <Card key={s.student.id} className="flex flex-col overflow-hidden shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    <span className="truncate">{s.student.username}</span>
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5" />
                    {s.student.email}
                  </CardDescription>
                </div>

                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {money(s.sent_this_month, currency)}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center gap-1 text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5" />
                    DAILY
                  </div>
                  <div className="font-semibold">{money(s.wallet?.buckets?.DAILY, currency)}</div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center gap-1 text-muted-foreground">
                    <PiggyBank className="h-3.5 w-3.5" />
                    SAVINGS
                  </div>
                  <div className="font-semibold">{money(s.wallet?.buckets?.SAVINGS, currency)}</div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center gap-1 text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" />
                    BILLS
                  </div>
                  <div className="font-semibold">{money(s.wallet?.buckets?.BILLS, currency)}</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Landmark className="h-4 w-4" />
                  Repartition this month
                </div>

                <div className="space-y-2">
                  {(s.repartition_this_month || []).length ? (
                    s.repartition_this_month.map((r, idx) => (
                      <BucketRow key={idx} item={r} currency={currency} />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                      No deposits yet.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Alerts
                </div>
                <Alerts alerts={s.alerts} />
              </div>
            </CardContent>

            <div className="p-4 pt-0">
              <Button asChild className="w-full gap-2 rounded-xl">
                <Link to={`/app/parent/students/${s.student.id}`}>
                  View student
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}