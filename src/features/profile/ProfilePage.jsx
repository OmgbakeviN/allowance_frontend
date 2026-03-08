import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { updateProfile, getParentAccount, getParentAccountTxns } from "@/features/profile/profileService"
import TopUpDialog from "@/features/profile/TopUpDialog"
import { money } from "@/lib/format"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowDownLeft,
  CreditCard,
  Mail,
  Save,
  Shield,
  Upload,
  User,
  Wallet,
} from "lucide-react"

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
}

function initialsFrom(user) {
  const a = user?.first_name?.[0] || ""
  const b = user?.last_name?.[0] || user?.username?.[0] || ""
  return `${a}${b}`.toUpperCase() || "U"
}

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#34E3CC]/20 via-[#4F9DFF]/20 to-[#7C5ADE]/20">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
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

  const avatarPreview = useMemo(() => {
    if (avatar) return URL.createObjectURL(avatar)
    return user?.avatar || ""
  }, [avatar, user?.avatar])

  useEffect(() => {
    return () => {
      if (avatarPreview && avatar) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview, avatar])

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

  if (!user) return <Skeleton className="h-40 w-full rounded-2xl" />

  const currency = acc?.currency || "XAF"

  return (
    <div className="space-y-6 max-w-5xl">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-background shadow-md">
              {avatarPreview ? <AvatarImage src={avatarPreview} alt="avatar" /> : null}
              <AvatarFallback className="bg-gradient-to-br from-[#34E3CC] via-[#4F9DFF] to-[#7C5ADE] text-white text-lg">
                {initialsFrom(user)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <CardTitle className="text-xl truncate">
                {user?.first_name || user?.last_name
                  ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
                  : user?.username}
              </CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                <span className="truncate">@{user?.username}</span>
                <span>•</span>
                <span className="truncate">{user?.email}</span>
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1">
              <Shield className="mr-1 h-3.5 w-3.5" />
              {user?.role}
            </Badge>
          </div>
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
            <User className="h-5 w-5" />
            Profile information
          </CardTitle>
          <CardDescription>Update your personal details and avatar.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Username: {user.username}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Role: {user.role}
            </Badge>
          </div>

          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  First name
                </Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                Avatar
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                className="rounded-xl"
              />
            </div>

            <Button type="submit" disabled={saving} className="gap-2 rounded-xl">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {user.role === "PARENT" ? (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Parent balance
              </CardTitle>
              <CardDescription>
                Top up balance, then deposit to students.
              </CardDescription>
            </div>
            <TopUpDialog currency={currency} onDone={loadParentAccount} />
          </CardHeader>

          <CardContent className="space-y-4">
            {loadingAcc ? (
              <Skeleton className="h-24 w-full rounded-2xl" />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard icon={Wallet} title="Balance" value={money(acc?.balance, currency)} />
                  <StatCard icon={CreditCard} title="Currency" value={currency} />
                  <StatCard icon={ArrowDownLeft} title="Transactions" value={txns.length} />
                </div>

                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="text-base">Recent transactions</CardTitle>
                    <CardDescription>Last balance top-ups</CardDescription>
                  </CardHeader>

                  <CardContent className="overflow-x-auto">
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
                            <TableCell>
                              <Badge variant="secondary" className="rounded-full">
                                {t.txn_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{money(t.gross_amount, currency)}</TableCell>
                            <TableCell className="text-right">{money(t.fee_amount, currency)}</TableCell>
                            <TableCell className="text-right font-medium">{money(t.net_amount, currency)}</TableCell>
                          </TableRow>
                        ))}
                        {txns.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-muted-foreground">
                              No transactions.
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}