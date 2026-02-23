import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { acceptInvite } from "@/features/relationships/relationshipsService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AcceptInvitePage() {
  const navigate = useNavigate()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(null)
    setLoading(true)
    try {
      const res = await acceptInvite(code)
      setSuccess(res)
      setCode("")
    } catch (err) {
      const data = err?.response?.data
      const msg =
        data?.code?.[0] ||
        data?.detail ||
        "Impossible d’accepter le code. Vérifie et réessaie."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Lier mon parent</CardTitle>
          <CardDescription>
            Entre le code d’invitation reçu du parent pour connecter vos comptes.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert className="mb-4">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert className="mb-4">
              <AlertDescription>
                ✅ Parent lié : <b>{success.parent?.username}</b> ({success.parent?.email || "—"})
              </AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code d’invitation</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="EX: A1B2C3D4E5"
                required
              />
              <div className="text-xs text-muted-foreground">
                Astuce : colle le code exactement comme reçu (10 caractères).
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Validation..." : "Valider"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/app/student/dashboard")}
              >
                Retour dashboard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}