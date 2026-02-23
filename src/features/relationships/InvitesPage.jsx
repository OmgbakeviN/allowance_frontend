import { useEffect, useState } from "react"

import { createInvite, getMyInvites } from "@/features/relationships/relationshipsService"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
}

export default function InvitesPage() {
  const [email, setEmail] = useState("")
  const [createdCode, setCreatedCode] = useState("")
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getMyInvites()
      setRows(data || [])
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load invites.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    setInfo("")
    setCreatedCode("")
    try {
      const res = await createInvite(email)
      setCreatedCode(res.code)
      setInfo("Invite created. Copy and share the code with the student.")
      setEmail("")
      await load()
    } catch (e2) {
      setError(e2?.response?.data?.detail || "Failed to create invite.")
    } finally {
      setCreating(false)
    }
  }

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setInfo("Code copied to clipboard.")
    } catch {
      setInfo("Copy failed. Select and copy manually.")
    }
  }

  if (loading) return <Skeleton className="h-40 w-full" />

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Invites</CardTitle>
          <CardDescription>Create an invite code for a student to link.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert className="mb-3">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          ) : null}

          {info ? (
            <Alert className="mb-3">
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={onCreate} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="email">Student email (optional)</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@email.com"
              />
              <div className="text-xs text-muted-foreground">
                If provided, it’s stored as a hint. The code is what matters.
              </div>
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create invite"}
            </Button>
          </form>

          {createdCode ? (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-md border p-3">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">New invite code</div>
                <div className="text-xl font-semibold tracking-wider">{createdCode}</div>
              </div>
              <Button variant="secondary" onClick={() => copy(createdCode)}>
                Copy
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My invites</CardTitle>
          <CardDescription>History of created invite codes.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.code}>
                  <TableCell className="font-mono font-semibold">{r.code}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "PENDING" ? "default" : "secondary"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmt(r.expires_at)}</TableCell>
                  <TableCell className="text-muted-foreground">{r.student_email || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{fmt(r.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => copy(r.code)}>
                      Copy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No invites yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}