import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getMyStudents, revokeStudent } from "@/features/relationships/relationshipsService"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
}

export default function StudentsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getMyStudents()
      setRows(data || [])
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load students.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onRevoke = async (studentId) => {
    setBusyId(studentId)
    setError("")
    try {
      await revokeStudent(studentId)
      await load()
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to revoke link.")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Skeleton className="h-40 w-full" />

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Students</CardTitle>
          <CardDescription>Students linked to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{rows.length}</span>
          </div>
          <Button asChild variant="secondary">
            <Link to="/app/parent/invites">Create invite</Link>
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardHeader>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>List</CardTitle>
          <CardDescription>View dashboards or revoke access.</CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Linked at</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.student?.username}</TableCell>
                  <TableCell className="text-muted-foreground">{r.student?.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "ACTIVE" ? "default" : "secondary"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmt(r.created_at)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/app/parent/students/${r.student?.id}`}>View</Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" disabled={busyId === r.student?.id}>
                          {busyId === r.student?.id ? "..." : "Revoke"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke link?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will revoke your access to this student data. The student can be re-linked later via a new invite.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRevoke(r.student?.id)}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No linked students yet. Create an invite code first.
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