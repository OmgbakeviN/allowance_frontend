import { useEffect, useMemo, useState } from "react"
import { money } from "@/lib/format"
import { getMyWallet, getMyWalletTransactions, updateMyWalletSettings } from "@/features/wallet/studentWalletService"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Landmark,
  PiggyBank,
  Receipt,
  Save,
  Settings2,
  Wallet,
} from "lucide-react"

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
}

function BucketBadge({ value }) {
  const styles = {
    DAILY: "bg-[#34E3CC]/10 text-[#0f766e] border-[#34E3CC]/30 dark:text-[#7ef3e0]",
    BILLS: "bg-[#4F9DFF]/10 text-[#1d4ed8] border-[#4F9DFF]/30 dark:text-[#93c5fd]",
    SAVINGS: "bg-[#7C5ADE]/10 text-[#6d28d9] border-[#7C5ADE]/30 dark:text-[#c4b5fd]",
  }

  return (
    <Badge variant="outline" className={`rounded-full ${styles[value] || ""}`}>
      {value}
    </Badge>
  )
}

function DirectionBadge({ value }) {
  const isIn = value === "IN"
  return (
    <Badge
      variant="outline"
      className={`rounded-full ${
        isIn
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      }`}
    >
      <span className="mr-1 inline-flex">
        {isIn ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
      </span>
      {value}
    </Badge>
  )
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

export default function StudentWalletPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  const [wallet, setWallet] = useState(null)
  const [txns, setTxns] = useState([])

  const [currency, setCurrency] = useState("XAF")
  const [dailyLimit, setDailyLimit] = useState("")
  const [saving, setSaving] = useState(false)

  const [limit, setLimit] = useState(30)

  const visibleTxns = useMemo(() => (txns || []).slice(0, limit), [txns, limit])

  const load = async () => {
    setLoading(true)
    setError("")
    setInfo("")
    try {
      const [w, t] = await Promise.all([getMyWallet(), getMyWalletTransactions()])
      setWallet(w)
      setTxns(t || [])
      setCurrency(w?.currency || "XAF")
      setDailyLimit(w?.daily_limit ?? "")
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load wallet.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const getBal = (type) => wallet?.buckets?.find((b) => b.bucket_type === type)?.balance

  const onSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setInfo("")
    try {
      const payload = {
        currency: (currency || "XAF").toUpperCase(),
        daily_limit: dailyLimit === "" ? "0" : String(dailyLimit),
      }
      await updateMyWalletSettings(payload)
      setInfo("Settings saved.")
      await load()
    } catch (e2) {
      const d = e2?.response?.data
      setError(d?.daily_limit?.[0] || d?.currency?.[0] || d?.detail || "Failed to save settings.")
    } finally {
      setSaving(false)
    }
  }

  if (loading && !wallet) return <Skeleton className="h-40 w-full rounded-2xl" />

  const cur = wallet?.currency || currency || "XAF"

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wallet className="h-5 w-5" />
              Wallet
            </CardTitle>
            <CardDescription>Balances, settings and transaction history</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {cur}
          </Badge>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} title="DAILY" value={money(getBal("DAILY"), cur)} />
        <StatCard icon={PiggyBank} title="SAVINGS" value={money(getBal("SAVINGS"), cur)} />
        <StatCard icon={Receipt} title="BILLS" value={money(getBal("BILLS"), cur)} />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Settings
          </CardTitle>
          <CardDescription>Currency and daily spending limit</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSave} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                Currency
              </Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="XAF"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Daily limit
              </Label>
              <Input
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="2000"
                className="rounded-xl"
              />
            </div>

            <Button type="submit" disabled={saving} className="gap-2 rounded-xl">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>

          <p className="mt-3 text-xs text-muted-foreground">0 means no daily limit.</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Transactions
          </CardTitle>
          <CardDescription>Ledger history, latest first</CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bucket</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visibleTxns.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{fmt(t.created_at)}</TableCell>
                  <TableCell>
                    <BucketBadge value={t.bucket_type} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full">
                      {t.txn_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DirectionBadge value={t.direction} />
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate">{t.description || "-"}</TableCell>
                  <TableCell className="text-right font-medium">{money(t.amount, cur)}</TableCell>
                </TableRow>
              ))}

              {visibleTxns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          {txns.length > limit ? (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => setLimit((v) => v + 30)} className="rounded-xl">
                Load more
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}