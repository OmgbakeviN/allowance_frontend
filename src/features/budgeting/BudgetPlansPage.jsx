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

function savingsText(p, currency) {
  if (p.savings_mode === "AMOUNT") return money(p.savings_amount, currency)
  if (p.savings_mode === "PERCENT") return `${p.savings_percent || 0}%`
  return "-"
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

  if (loading) return <Skeleton className="h-40 w-full" />

  const currency = plans?.[0]?.currency || "XAF"

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Budget plans</CardTitle>
            <CardDescription>Create plans, add bills, and activate one.</CardDescription>
          </div>
          <PlanFormDialog
            triggerLabel="New plan"
            title="Create plan"
            description="Create a monthly plan (inactive by default)."
            onSubmit={onCreate}
          />
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert>
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="truncate">{p.name}</span>
                <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>{p.status}</Badge>
              </CardTitle>
              <CardDescription>
                {p.currency} • Daily limit: {money(p.daily_limit, p.currency)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 flex-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Savings</span>
                <span className="font-medium">{savingsText(p, p.currency)}</span>
              </div>
              <div className="text-muted-foreground">
                Created: {new Date(p.created_at).toLocaleString("fr-FR")}
              </div>
            </CardContent>

            <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link to={`/app/student/budget-plans/${p.id}`}>View</Link>
              </Button>

              <Button
                className="w-full"
                disabled={p.status === "ACTIVE" || busyId === p.id}
                onClick={() => onActivate(p.id)}
              >
                {busyId === p.id ? "..." : "Activate"}
              </Button>
            </div>
          </Card>
        ))}

        {plans.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No plans yet</CardTitle>
              <CardDescription>Create your first plan.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </div>
  )
}