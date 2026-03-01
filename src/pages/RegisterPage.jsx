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
    <div className="min-h-svh flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Register and access your dashboard.</CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert className="mb-4">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Account type</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="PARENT">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="joseph"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>

            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}