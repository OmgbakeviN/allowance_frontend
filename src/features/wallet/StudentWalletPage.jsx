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

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
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

  if (loading && !wallet) return <Skeleton className="h-40 w-full" />

  const cur = wallet?.currency || currency || "XAF"

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Balances, settings, and transactions</CardDescription>
          </div>
          <Badge variant="outline">{cur}</Badge>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">DAILY</div>
              <div className="text-xl font-semibold">{money(getBal("DAILY"), cur)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">SAVINGS</div>
              <div className="text-xl font-semibold">{money(getBal("SAVINGS"), cur)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">BILLS</div>
              <div className="text-xl font-semibold">{money(getBal("BILLS"), cur)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Currency + daily spending limit (0 = no limit)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="XAF" />
            </div>
            <div className="space-y-2">
              <Label>Daily limit</Label>
              <Input
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="2000"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Ledger (latest first)</CardDescription>
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
                    <Badge variant="outline">{t.bucket_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t.txn_type}</Badge>
                  </TableCell>
                  <TableCell>{t.direction}</TableCell>
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
              <Button variant="secondary" onClick={() => setLimit((v) => v + 30)}>
                Load more
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}