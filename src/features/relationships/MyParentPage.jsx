import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getMyParent } from "@/features/relationships/relationshipsService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  if (loading) return <Skeleton className="h-40 w-full" />

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mon Parent</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (notLinked) {
    return (
      <div className="max-w-xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Mon Parent</CardTitle>
            <CardDescription>Ton compte n’est pas encore lié à un parent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertDescription>
                Demande au parent de générer un code d’invitation, puis valide-le ici.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/app/student/link-parent")}>Lier mon parent</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const parent = data?.parent
  const status = data?.status

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mon Parent</CardTitle>
          <CardDescription>Informations du parent lié à ton compte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">{parent?.username}</div>
              <div className="text-sm text-muted-foreground truncate">{parent?.email || "-"}</div>
            </div>
            <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>{status}</Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            Lié depuis : <span className="text-foreground">{fmt(data?.created_at)}</span>
          </div>

          <Alert>
            <AlertDescription>
              Pour changer de parent, le parent actuel doit d’abord révoquer le lien, puis tu acceptes un nouveau code.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/app/student/link-parent")}>
              Entrer un code (si lien révoqué)
            </Button>
            <Button onClick={() => navigate("/app/student/dashboard")}>Retour dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}