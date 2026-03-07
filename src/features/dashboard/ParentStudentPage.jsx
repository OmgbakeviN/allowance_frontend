import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { getParentStudentDashboard } from "@/features/dashboard/dashboardService"
import ParentStudentExpensesTab from "@/features/expenses/ParentStudentExpensesTab"
import ParentStudentWalletTab from "@/features/wallet/ParentStudentWalletTab"
import DepositDialog from "@/features/wallet/DepositDialog"
import ParentStudentActivePlanTab from "@/features/budgeting/ParentStudentActivePlanTab"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  User,
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

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

function DashboardTab({ data }) {
  const currency = data?.wallet?.currency || "XAF"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet
            </CardTitle>
            <CardDescription>Bucket balances</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <MiniStat
              icon={Wallet}
              label="DAILY"
              value={money(data.wallet?.buckets?.DAILY, currency)}
            />
            <MiniStat
              icon={PiggyBank}
              label="SAVINGS"
              value={money(data.wallet?.buckets?.SAVINGS, currency)}
            />
            <MiniStat
              icon={Receipt}
              label="BILLS"
              value={money(data.wallet?.buckets?.BILLS, currency)}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Spending
            </CardTitle>
            <CardDescription>Today and this month</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <MiniStat
              icon={Receipt}
              label="Spent today"
              value={money(data.spending?.spent_today, currency)}
            />
            <MiniStat
              icon={Wallet}
              label="Remaining today"
              value={
                data.spending?.daily_remaining_today
                  ? money(data.spending.daily_remaining_today, currency)
                  : "-"
              }
            />
            <MiniStat
              icon={PiggyBank}
              label="Month expenses"
              value={money(data.spending?.total_month_expenses, currency)}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts
            </CardTitle>
            <CardDescription>Student status</CardDescription>
          </CardHeader>
          <CardContent>
            <Alerts alerts={data.alerts} />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Repartition this month
          </CardTitle>
          <CardDescription>Deposits allocation by bucket</CardDescription>
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
                  <TableCell className="font-medium">{r.bucket_type}</TableCell>
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
  const [walletRefreshKey, setWalletRefreshKey] = useState(0)

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
  }, [id, walletRefreshKey])

  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />

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
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5" />
                <span className="truncate">{data.student.username}</span>
              </CardTitle>
              <CardDescription className="truncate">{data.student.email}</CardDescription>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {money(data.sent_this_month, currency)}
              </Badge>

              <DepositDialog
                studentId={id}
                currency={currency}
                onDeposited={() => {
                  setWalletRefreshKey((k) => k + 1)
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-muted/60 p-1">
          <TabsTrigger value="dashboard" className="gap-2 rounded-xl">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2 rounded-xl">
            <Receipt className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="wallet" className="gap-2 rounded-xl">
            <Wallet className="h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2 rounded-xl">
            <PiggyBank className="h-4 w-4" />
            Active plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <DashboardTab data={data} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <ParentStudentExpensesTab studentId={id} currency={currency} />
        </TabsContent>

        <TabsContent value="wallet" className="mt-4">
          <ParentStudentWalletTab studentId={id} refreshKey={walletRefreshKey} />
        </TabsContent>

        <TabsContent value="plan" className="mt-4">
          <ParentStudentActivePlanTab studentId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}