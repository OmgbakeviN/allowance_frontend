import { useEffect, useMemo, useState } from "react"
import { getStudentActivePlan } from "@/features/budgeting/budgetingService"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

  if (loading) return <Skeleton className="h-40 w-full" />

  if (error) {
    return (
      <Alert>
        <AlertDescription className="text-destructive">{error}</AlertDescription>
      </Alert>
    )
  }

  if (notFound) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active plan</CardTitle>
          <CardDescription className="text-muted-foreground">Student has no active plan.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Active plan</CardTitle>
          <CardDescription>{plan?.name}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground">Currency</div>
            <div className="font-semibold">{currency}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground">Daily limit</div>
            <div className="font-semibold">{money(plan?.daily_limit, currency)}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground">Savings</div>
            <div className="font-semibold">
              <Badge variant="secondary">{plan?.savings_mode}</Badge>
              <span className="ml-2">{savingsLabel}</span>
            </div>
          </div>
          <div className="rounded-md border p-3 md:col-span-3">
            <div className="text-muted-foreground">Total bills</div>
            <div className="text-xl font-semibold">{totalBills}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
          <CardDescription>Fixed charges (priority order)</CardDescription>
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
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.priority}</TableCell>
                  <TableCell className="text-muted-foreground">{b.due_day ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={b.is_mandatory ? "default" : "secondary"}>
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