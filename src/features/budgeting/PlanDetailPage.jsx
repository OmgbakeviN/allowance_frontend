import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { getPlan, updatePlan, activatePlan, createBill, updateBill, deleteBill } from "@/features/budgeting/budgetingService"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PlanFormDialog from "@/features/budgeting/PlanFormDialog"
import BillFormDialog from "@/features/budgeting/BillFormDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Pencil,
  PiggyBank,
  Plus,
  Receipt,
  Trash2,
  Wallet,
} from "lucide-react"

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#34E3CC]/20 via-[#4F9DFF]/20 to-[#7C5ADE]/20">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </div>
      <div className="text-xl font-semibold">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
    </div>
  )
}

export default function PlanDetailPage() {
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [plan, setPlan] = useState(null)
  const [busyActivate, setBusyActivate] = useState(false)
  const [busyBillId, setBusyBillId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getPlan(id)
      setPlan(data)
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load plan.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const currency = plan?.currency || "XAF"
  const bills = plan?.bills || []

  const totalBills = useMemo(() => {
    const sum = bills.reduce((acc, b) => acc + Number(b.amount || 0), 0)
    return money(sum, currency)
  }, [bills, currency])

  const onEditPlan = async (payload) => {
    await updatePlan(id, payload)
    await load()
  }

  const onActivate = async () => {
    setBusyActivate(true)
    setError("")
    try {
      await activatePlan(id)
      await load()
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to activate plan.")
    } finally {
      setBusyActivate(false)
    }
  }

  const onCreateBill = async (payload) => {
    await createBill(id, payload)
    await load()
  }

  const onEditBill = async (billId, payload) => {
    setBusyBillId(billId)
    try {
      await updateBill(billId, payload)
      await load()
    } finally {
      setBusyBillId(null)
    }
  }

  const onDeleteBill = async (billId) => {
    setBusyBillId(billId)
    setError("")
    try {
      await deleteBill(billId)
      await load()
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to delete bill.")
    } finally {
      setBusyBillId(null)
    }
  }

  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />

  if (error && !plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const savingsLabel =
    plan?.savings_mode === "AMOUNT"
      ? money(plan?.savings_amount, currency)
      : plan?.savings_mode === "PERCENT"
      ? `${plan?.savings_percent || 0}%`
      : "-"

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2">
                <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Link to="/app/student/budget-plans">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Link>
                </Button>
              </div>

              <CardTitle className="truncate text-xl">{plan.name}</CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                <span>{currency}</span>
                <span>•</span>
                <span>Daily limit: {money(plan.daily_limit, currency)}</span>
                <span>•</span>
                <span>Savings: {savingsLabel}</span>
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={plan.status === "ACTIVE" ? "default" : "secondary"} className="rounded-full px-3 py-1">
                {plan.status}
              </Badge>

              <PlanFormDialog
                triggerLabel="Edit plan"
                triggerVariant="secondary"
                title="Edit plan"
                description="Update plan settings."
                initial={plan}
                onSubmit={onEditPlan}
              />

              <Button
                disabled={plan.status === "ACTIVE" || busyActivate}
                onClick={onActivate}
                className="gap-2 rounded-xl"
              >
                <CheckCircle2 className="h-4 w-4" />
                {busyActivate ? "..." : "Activate"}
              </Button>
            </div>
          </div>

          {error ? (
            <Alert className="rounded-2xl">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Receipt}
          title="Total bills"
          value={totalBills}
          subtitle="All fixed charges"
        />
        <StatCard
          icon={PiggyBank}
          title="Bills count"
          value={bills.length}
          subtitle="Items in this plan"
        />
        <StatCard
          icon={Wallet}
          title="Daily limit"
          value={money(plan.daily_limit, currency)}
          subtitle="Per day allowance"
        />
        <StatCard
          icon={CalendarDays}
          title="Created"
          value={new Date(plan.created_at).toLocaleDateString("fr-FR")}
          subtitle={new Date(plan.created_at).toLocaleTimeString("fr-FR")}
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Bills
            </CardTitle>
            <CardDescription>Fixed charges used in automatic allocation</CardDescription>
          </div>

          <BillFormDialog
            triggerLabel="Add bill"
            title="Create bill"
            description="Add a fixed charge."
            onSubmit={onCreateBill}
          />
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
                <TableHead className="text-right">Actions</TableHead>
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

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <BillFormDialog
                        triggerLabel="Edit"
                        triggerVariant="outline"
                        title="Edit bill"
                        description="Update this fixed charge."
                        initial={b}
                        onSubmit={(payload) => onEditBill(b.id, payload)}
                      />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={busyBillId === b.id} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            {busyBillId === b.id ? "..." : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete bill?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the bill from the plan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteBill(b.id)}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No bills yet. Add your first bill.
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