import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowRight,
  Lock,
  LogIn,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const me = await login({ username: username.trim(), password })
      if (me.role === "PARENT") navigate("/app/parent/dashboard", { replace: true })
      else navigate("/app/student/dashboard", { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.detail || "Identifiants incorrects. Réessaie."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid grid-cols-1 overflow-hidden rounded-3xl border bg-card shadow-xl lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#34E3CC]/20 via-[#4F9DFF]/15 to-[#7C5ADE]/20 p-10">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34E3CC] via-[#4F9DFF] to-[#7C5ADE] text-white shadow-md">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xl font-semibold tracking-tight">Budggio</div>
                <div className="text-sm text-muted-foreground">Smart budget management</div>
              </div>
            </div>

            <div className="max-w-md">
              <h1 className="text-3xl font-bold leading-tight">
                Connecte-toi et garde le contrôle de ton budget étudiant.
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Une plateforme simple pour suivre les dépenses, gérer les plans budgétaires
                et garder une relation parent–étudiant plus claire.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border bg-background/70 p-4 backdrop-blur">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Secure access
              </div>
              <div className="text-sm text-muted-foreground">
                Student and parent spaces with dedicated dashboards.
              </div>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4 backdrop-blur">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Wallet className="h-4 w-4" />
                Better money tracking
              </div>
              <div className="text-sm text-muted-foreground">
                Monitor wallet balances, deposits and daily spending in one place.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34E3CC] via-[#4F9DFF] to-[#7C5ADE] text-white shadow-md lg:hidden">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Connexion</CardTitle>
                <CardDescription className="mt-1">
                  Connecte-toi pour accéder à ton espace Budggio.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {error ? (
                <Alert className="mb-4 rounded-2xl">
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: joseph"
                    autoComplete="username"
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    autoComplete="current-password"
                    required
                    className="rounded-xl"
                  />
                </div>

                <Button type="submit" className="w-full gap-2 rounded-xl" disabled={loading}>
                  <LogIn className="h-4 w-4" />
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
                    onClick={() => navigate("/register")}
                  >
                    Créer un compte
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}