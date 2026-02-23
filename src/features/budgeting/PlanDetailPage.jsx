import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

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

export default function PlanDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

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

  if (loading) return <Skeleton className="h-40 w-full" />

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
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="truncate">{plan.name}</CardTitle>
              <CardDescription>
                {currency} • Daily limit: {money(plan.daily_limit, currency)} • Savings: {plan.savings_mode} {savingsLabel}
              </CardDescription>
            </div>
            <Badge variant={plan.status === "ACTIVE" ? "default" : "secondary"}>{plan.status}</Badge>
          </div>

          {error ? (
            <Alert>
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/app/student/budget-plans">Back</Link>
            </Button>

            <PlanFormDialog
              triggerLabel="Edit plan"
              triggerVariant="secondary"
              title="Edit plan"
              description="Update plan settings."
              initial={plan}
              onSubmit={onEditPlan}
            />

            <Button disabled={plan.status === "ACTIVE" || busyActivate} onClick={onActivate}>
              {busyActivate ? "..." : "Activate"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground">Total bills</div>
            <div className="text-xl font-semibold">{totalBills}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground">Bills count</div>
            <div className="text-xl font-semibold">{bills.length}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="text-sm">{new Date(plan.created_at).toLocaleString("fr-FR")}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Bills</CardTitle>
            <CardDescription>Fixed charges used in auto allocation (priority order).</CardDescription>
          </div>
          <BillFormDialog
            triggerLabel="Add bill"
            title="Create bill"
            description="Add a fixed charge (rent, internet...)."
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
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.priority}</TableCell>
                  <TableCell className="text-muted-foreground">{b.due_day ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={b.is_mandatory ? "default" : "secondary"}>
                      {b.is_mandatory ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{money(b.amount, currency)}</TableCell>
                  <TableCell className="text-right space-x-2">
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
                        <Button variant="destructive" size="sm" disabled={busyBillId === b.id}>
                          {busyBillId === b.id ? "..." : "Delete"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete bill?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the bill from the plan. Allocation will no longer include it.
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