import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { registerRequest } from "@/auth/authService"
import { useAuth } from "@/auth/useAuth"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowRight,
  Lock,
  Mail,
  Shield,
  User,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"

function pickErrorMessage(d) {
  if (!d) return "Registration failed."
  if (typeof d === "string") return d
  if (d.detail) return d.detail
  const keys = ["username", "email", "password", "role", "first_name", "last_name", "non_field_errors"]
  for (const k of keys) {
    const v = d[k]
    if (Array.isArray(v) && v[0]) return v[0]
    if (typeof v === "string") return v
  }
  const firstKey = Object.keys(d)[0]
  if (firstKey) {
    const v = d[firstKey]
    if (Array.isArray(v) && v[0]) return v[0]
  }
  return "Registration failed."
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [role, setRole] = useState("STUDENT")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== password2) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await registerRequest({
        role,
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
      })

      const me = await login({ username: username.trim(), password })
      if (me.role === "PARENT") navigate("/app/parent/dashboard", { replace: true })
      else navigate("/app/student/dashboard", { replace: true })
    } catch (err) {
      setError(pickErrorMessage(err?.response?.data))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl grid grid-cols-1 overflow-hidden rounded-3xl border bg-card shadow-xl lg:grid-cols-2">
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
                Crée ton compte et commence à gérer ton budget intelligemment.
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Que tu sois étudiant ou parent, Budggio te permet de suivre l’argent,
                les dépenses et les objectifs budgétaires dans une seule app.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border bg-background/70 p-4 backdrop-blur">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Two account types
              </div>
              <div className="text-sm text-muted-foreground">
                Choose Student or Parent depending on your role.
              </div>
            </div>

            <div className="rounded-2xl border bg-background/70 p-4 backdrop-blur">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                Clear budget control
              </div>
              <div className="text-sm text-muted-foreground">
                Plans, deposits, expenses and wallet management in one flow.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-xl border-0 shadow-none">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34E3CC] via-[#4F9DFF] to-[#7C5ADE] text-white shadow-md lg:hidden">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Create account</CardTitle>
                <CardDescription className="mt-1">
                  Register and access your Budggio dashboard.
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
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Account type
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="PARENT">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      First name
                    </Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Last name
                    </Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Username
                    </Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="joseph"
                      autoComplete="username"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      autoComplete="email"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Password
                    </Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Confirm password
                    </Label>
                    <Input
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      autoComplete="new-password"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <Button className="w-full gap-2 rounded-xl" type="submit" disabled={loading}>
                  <UserPlus className="h-4 w-4" />
                  {loading ? "Creating..." : "Create account"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
                    onClick={() => navigate("/login")}
                  >
                    Login
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