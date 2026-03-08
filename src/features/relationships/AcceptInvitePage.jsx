import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { acceptInvite } from "@/features/relationships/relationshipsService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, KeyRound, Link2, Undo2 } from "lucide-react"

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
    <div className="max-w-xl space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Link2 className="h-5 w-5" />
            Link my parent
          </CardTitle>
          <CardDescription>
            Enter the invite code received from the parent to connect your accounts.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          {error ? (
            <Alert className="mb-4 rounded-2xl">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert className="mb-4 rounded-2xl">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Parent linked: <b>{success.parent?.username}</b> ({success.parent?.email || "—"})
              </AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                Invite code
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="EX: A1B2C3D4E5"
                required
                className="rounded-xl tracking-[0.2em] uppercase"
              />
              <div className="text-xs text-muted-foreground">
                Tip: paste the code exactly as received.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading} className="gap-2 rounded-xl">
                <Link2 className="h-4 w-4" />
                {loading ? "Validating..." : "Validate"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/app/student/dashboard")}
                className="gap-2 rounded-xl"
              >
                <Undo2 className="h-4 w-4" />
                Back to dashboard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}