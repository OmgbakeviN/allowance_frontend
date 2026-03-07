import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { listMyPlans, createPlan, activatePlan } from "@/features/budgeting/budgetingService"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PlanFormDialog from "@/features/budgeting/PlanFormDialog"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  PiggyBank,
  Plus,
  Wallet,
} from "lucide-react"

function savingsText(p, currency) {
  if (p.savings_mode === "AMOUNT") return money(p.savings_amount, currency)
  if (p.savings_mode === "PERCENT") return `${p.savings_percent || 0}%`
  return "-"
}

function PlanStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}

export default function BudgetPlansPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [plans, setPlans] = useState([])
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await listMyPlans()
      setPlans(data || [])
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load plans.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCreate = async (payload) => {
    await createPlan(payload)
    await load()
  }

  const onActivate = async (planId) => {
    setBusyId(planId)
    setError("")
    try {
      await activatePlan(planId)
      await load()
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to activate plan.")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wallet className="h-5 w-5" />
              Budget plans
            </CardTitle>
            <CardDescription>Create, manage and activate your monthly plans</CardDescription>
          </div>

          <PlanFormDialog
            triggerLabel="New plan"
            title="Create plan"
            description="Create a monthly plan."
            onSubmit={onCreate}
          />
        </CardHeader>
      </Card>

      {error ? (
        <Alert className="rounded-2xl">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className="flex flex-col overflow-hidden shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{p.name}</CardTitle>
                  <CardDescription className="mt-1">{p.currency}</CardDescription>
                </div>

                <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"} className="rounded-full px-3 py-1">
                  {p.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PlanStat
                  icon={Wallet}
                  label="Daily limit"
                  value={money(p.daily_limit, p.currency)}
                />
                <PlanStat
                  icon={PiggyBank}
                  label="Savings"
                  value={savingsText(p, p.currency)}
                />
              </div>

              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Created: {new Date(p.created_at).toLocaleString("fr-FR")}</span>
              </div>
            </CardHeader>

            <CardContent className="mt-auto">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button asChild variant="outline" className="gap-2 rounded-xl">
                  <Link to={`/app/student/budget-plans/${p.id}`}>
                    View
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  className="gap-2 rounded-xl"
                  disabled={p.status === "ACTIVE" || busyId === p.id}
                  onClick={() => onActivate(p.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {busyId === p.id ? "..." : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {plans.length === 0 ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                No plans yet
              </CardTitle>
              <CardDescription>Create your first plan.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </div>
  )
}