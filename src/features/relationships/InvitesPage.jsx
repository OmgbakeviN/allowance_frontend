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
import {
  Copy,
  Mail,
  PlusCircle,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react"

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

  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Ticket className="h-5 w-5" />
            Invites
          </CardTitle>
          <CardDescription>Create codes to link students to your account.</CardDescription>
        </CardHeader>
      </Card>

      {error ? (
        <Alert className="rounded-2xl">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      ) : null}

      {info ? (
        <Alert className="rounded-2xl">
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create invite
          </CardTitle>
          <CardDescription>Generate a new student invite code.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Student email
              </Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@email.com"
                className="rounded-xl"
              />
              <div className="text-xs text-muted-foreground">
                Optional. Stored as a hint only.
              </div>
            </div>
            <Button type="submit" disabled={creating} className="gap-2 rounded-xl">
              <PlusCircle className="h-4 w-4" />
              {creating ? "Creating..." : "Create invite"}
            </Button>
          </form>

          {createdCode ? (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border p-4 shadow-sm">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">New invite code</div>
                <div className="text-2xl font-semibold tracking-[0.2em]">{createdCode}</div>
              </div>
              <Button variant="secondary" onClick={() => copy(createdCode)} className="gap-2 rounded-xl">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My invites
            </CardTitle>
            <CardDescription>History of generated codes</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {rows.length} total
          </Badge>
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
                    <Badge
                      variant={r.status === "PENDING" ? "default" : "secondary"}
                      className="rounded-full"
                    >
                      {r.status === "PENDING" ? <ShieldCheck className="mr-1 h-3.5 w-3.5" /> : null}
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmt(r.expires_at)}</TableCell>
                  <TableCell className="text-muted-foreground">{r.student_email || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{fmt(r.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => copy(r.code)} className="gap-2 rounded-xl">
                      <Copy className="h-4 w-4" />
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