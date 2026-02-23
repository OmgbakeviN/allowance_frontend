import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { getParentStudentDashboard } from "@/features/dashboard/dashboardService"
import ParentStudentExpensesTab from "@/features/expenses/ParentStudentExpensesTab"
import ParentStudentWalletTab from "@/features/wallet/ParentStudentWalletTab"
import ParentStudentActivePlanTab from "@/features/budgeting/ParentStudentActivePlanTab"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

function DashboardTab({ data }) {
  const currency = data?.wallet?.currency || "XAF"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Balances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">DAILY</span>
              <span className="font-medium">{money(data.wallet?.buckets?.DAILY, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SAVINGS</span>
              <span className="font-medium">{money(data.wallet?.buckets?.SAVINGS, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BILLS</span>
              <span className="font-medium">{money(data.wallet?.buckets?.BILLS, currency)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending</CardTitle>
            <CardDescription>Today & month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spent today</span>
              <span className="font-medium">{money(data.spending?.spent_today, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining today</span>
              <span className="font-medium">
                {data.spending?.daily_remaining_today ? money(data.spending.daily_remaining_today, currency) : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month expenses</span>
              <span className="font-medium">{money(data.spending?.total_month_expenses, currency)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Status</CardDescription>
          </CardHeader>
          <CardContent>
            <Alerts alerts={data.alerts} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repartition this month</CardTitle>
          <CardDescription>Deposits allocation (BILLS / SAVINGS / DAILY)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bucket</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.repartition_this_month || []).map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.bucket_type}</TableCell>
                  <TableCell className="text-right">{money(r.total, currency)}</TableCell>
                </TableRow>
              ))}
              {(!data.repartition_this_month || data.repartition_this_month.length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    No deposits yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ParentStudentPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const res = await getParentStudentDashboard(id)
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
  }, [id])

  if (loading) return <Skeleton className="h-40 w-full" />

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const currency = data?.wallet?.currency || "XAF"

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="truncate">{data.student.username}</span>
            <Badge variant="outline">{money(data.sent_this_month, currency)}</Badge>
          </CardTitle>
          <CardDescription className="truncate">{data.student.email}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="plan">Active plan</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <DashboardTab data={data} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <ParentStudentExpensesTab studentId={id} currency={currency} />
        </TabsContent>
        
        <TabsContent value="wallet" className="mt-4">
          <ParentStudentWalletTab studentId={id} />
        </TabsContent>
        
        <TabsContent value="plan" className="mt-4">
          <ParentStudentActivePlanTab studentId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}