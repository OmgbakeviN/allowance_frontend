import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {useAuth} from "@/auth/useAuth"

import { loginRequest, fetchMe } from "@/auth/authService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

function redirectByRole(role, navigate) {
  if (role === "PARENT") return navigate("/app/parent/dashboard", { replace: true })
  if (role === "STUDENT") return navigate("/app/student/dashboard", { replace: true })
  return navigate("/app", { replace: true })
}

export default function LoginPage() {
  const {login} = useAuth()
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
    const msg =
      err?.response?.data?.detail ||
      "Identifiants incorrects. Réessaie."
    setError(msg)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-svh flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Connecte-toi pour accéder à ton espace.</CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username (ou email si tu l’utilises comme username)</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: joseph"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => navigate("/register")}
              >
                Créer un compte
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}