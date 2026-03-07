import { useEffect, useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { updateProfile, getParentAccount, getParentAccountTxns } from "@/features/profile/profileService"
import TopUpDialog from "@/features/profile/TopUpDialog"
import { money } from "@/lib/format"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
}

export default function ProfilePage() {
  const { user, setUser } = useAuth()

  const [firstName, setFirstName] = useState(user?.first_name || "")
  const [lastName, setLastName] = useState(user?.last_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [avatar, setAvatar] = useState(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  const [acc, setAcc] = useState(null)
  const [txns, setTxns] = useState([])
  const [loadingAcc, setLoadingAcc] = useState(false)

  const loadParentAccount = async () => {
    if (user?.role !== "PARENT") return
    setLoadingAcc(true)
    try {
      const [a, t] = await Promise.all([getParentAccount(), getParentAccountTxns()])
      setAcc(a)
      setTxns(t || [])
    } finally {
      setLoadingAcc(false)
    }
  }

  useEffect(() => {
    loadParentAccount()
  }, [user?.role])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setInfo("")
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        avatar,
      }
      const updated = await updateProfile(payload)
      setUser({ ...user, ...updated })
      setInfo("Profile updated.")
      setAvatar(null)
    } catch (err) {
      const d = err?.response?.data
      setError(d?.detail || d?.email?.[0] || "Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <Skeleton className="h-40 w-full" />

  const currency = acc?.currency || "XAF"

  return (
    <div className="space-y-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Account information and avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? <Alert className="mb-3"><AlertDescription className="text-destructive">{error}</AlertDescription></Alert> : null}
          {info ? <Alert className="mb-3"><AlertDescription>{info}</AlertDescription></Alert> : null}

          <div className="text-sm text-muted-foreground mb-4">
            Username: <span className="text-foreground font-medium">{user.username}</span> • Role: <span className="text-foreground font-medium">{user.role}</span>
          </div>

          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Avatar</Label>
              <Input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {user.role === "PARENT" ? (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Parent balance</CardTitle>
              <CardDescription>Top up balance (fees applied) then deposit to students.</CardDescription>
            </div>
            <TopUpDialog currency={currency} onDone={loadParentAccount} />
          </CardHeader>

          <CardContent>
            {loadingAcc ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-md border p-3">
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="text-xl font-semibold">{money(acc?.balance, currency)}</div>
                </div>
                <div className="rounded-md border p-3 md:col-span-2">
                  <div className="text-sm text-muted-foreground">Recent transactions</div>
                  <div className="mt-2 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Gross</TableHead>
                          <TableHead className="text-right">Fee</TableHead>
                          <TableHead className="text-right">Net</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {txns.slice(0, 8).map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="text-muted-foreground">{fmt(t.created_at)}</TableCell>
                            <TableCell>{t.txn_type}</TableCell>
                            <TableCell className="text-right">{money(t.gross_amount, currency)}</TableCell>
                            <TableCell className="text-right">{money(t.fee_amount, currency)}</TableCell>
                            <TableCell className="text-right">{money(t.net_amount, currency)}</TableCell>
                          </TableRow>
                        ))}
                        {txns.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-muted-foreground">No transactions.</TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}