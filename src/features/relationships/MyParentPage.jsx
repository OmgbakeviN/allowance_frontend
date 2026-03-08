import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getMyParent } from "@/features/relationships/relationshipsService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, CalendarDays, Link2, Shield, UserRound } from "lucide-react"

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
}

export default function MyParentPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notLinked, setNotLinked] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError("")
      setNotLinked(false)

      try {
        const res = await getMyParent()
        if (mounted) setData(res)
      } catch (e) {
        const status = e?.response?.status
        if (status === 404) {
          if (mounted) setNotLinked(true)
        } else {
          if (mounted) setError(e?.response?.data?.detail || "Impossible de charger le parent.")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => (mounted = false)
  }, [])

  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>My parent</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (notLinked) {
    return (
      <div className="max-w-2xl space-y-4">
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Link2 className="h-5 w-5" />
              My parent
            </CardTitle>
            <CardDescription>Your account is not linked yet.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <Alert className="rounded-2xl">
              <AlertDescription>
                Ask the parent to generate an invite code, then validate it here.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/app/student/link-parent")} className="gap-2 rounded-xl">
              <ArrowRight className="h-4 w-4" />
              Link my parent
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const parent = data?.parent
  const status = data?.status

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserRound className="h-5 w-5" />
            My parent
          </CardTitle>
          <CardDescription>Information about the linked parent account.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg font-semibold truncate">{parent?.username}</div>
              <div className="text-sm text-muted-foreground truncate">{parent?.email || "-"}</div>
            </div>
            <Badge variant={status === "ACTIVE" ? "default" : "secondary"} className="rounded-full px-3 py-1">
              <Shield className="mr-1 h-3.5 w-3.5" />
              {status}
            </Badge>
          </div>

          <div className="rounded-2xl border p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Linked since
            </div>
            <div className="font-medium">{fmt(data?.created_at)}</div>
          </div>

          <Alert className="rounded-2xl">
            <AlertDescription>
              To change parent, the current link must be revoked first, then you can accept a new code.
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate("/app/student/link-parent")} className="rounded-xl">
              Enter a new code
            </Button>
            <Button onClick={() => navigate("/app/student/dashboard")} className="rounded-xl">
              Back to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}