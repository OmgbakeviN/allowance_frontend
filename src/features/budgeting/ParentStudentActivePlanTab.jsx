import { useEffect, useMemo, useState } from "react"
import { getStudentActivePlan } from "@/features/budgeting/budgetingService"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BadgePercent,
  CalendarDays,
  CircleDollarSign,
  FileText,
  PiggyBank,
  Receipt,
  Wallet,
} from "lucide-react"

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#34E3CC]/20 via-[#4F9DFF]/20 to-[#7C5ADE]/20">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </div>
      <div className="text-lg font-semibold">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
    </div>
  )
}

export default function ParentStudentActivePlanTab({ studentId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError("")
      setNotFound(false)
      try {
        const res = await getStudentActivePlan(studentId)
        if (!mounted) return
        setPlan(res)
      } catch (e) {
        if (!mounted) return
        if (e?.response?.status === 404) setNotFound(true)
        else setError(e?.response?.data?.detail || "Failed to load active plan.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [studentId])

  const currency = plan?.currency || "XAF"
  const bills = plan?.bills || []

  const totalBills = useMemo(() => {
    const sum = bills.reduce((acc, b) => acc + Number(b.amount || 0), 0)
    return money(sum, currency)
  }, [bills, currency])

  const savingsLabel =
    plan?.savings_mode === "AMOUNT"
      ? money(plan?.savings_amount, currency)
      : plan?.savings_mode === "PERCENT"
      ? `${plan?.savings_percent || 0}%`
      : "-"

  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />

  if (error) {
    return (
      <Alert className="rounded-2xl">
        <AlertDescription className="text-destructive">{error}</AlertDescription>
      </Alert>
    )
  }

  if (notFound) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Active plan
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Student has no active plan.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5" />
              Active plan
            </CardTitle>
            <CardDescription className="truncate">{plan?.name}</CardDescription>
          </div>

          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {currency}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CircleDollarSign}
          title="Currency"
          value={currency}
          subtitle="Plan currency"
        />
        <StatCard
          icon={Wallet}
          title="Daily limit"
          value={money(plan?.daily_limit, currency)}
          subtitle="Daily spending cap"
        />
        <StatCard
          icon={PiggyBank}
          title="Savings"
          value={savingsLabel}
          subtitle={plan?.savings_mode || "NONE"}
        />
        <StatCard
          icon={Receipt}
          title="Total bills"
          value={totalBills}
          subtitle={`${bills.length} fixed charge(s)`}
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Bills
          </CardTitle>
          <CardDescription>Fixed charges by priority order</CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due day</TableHead>
                <TableHead>Mandatory</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bills.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <span>{b.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                      <BadgePercent className="h-3.5 w-3.5" />
                      {b.priority}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {b.due_day ?? "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.is_mandatory ? "default" : "secondary"} className="rounded-full">
                      {b.is_mandatory ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{money(b.amount, currency)}</TableCell>
                </TableRow>
              ))}

              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No bills in plan.
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