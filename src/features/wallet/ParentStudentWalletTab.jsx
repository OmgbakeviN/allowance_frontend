import { useEffect, useMemo, useState } from "react"
import { money } from "@/lib/format"
import { getStudentWallet, getStudentWalletTransactions } from "@/features/wallet/walletService"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  Receipt,
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

export default function ParentStudentWalletTab({ studentId, refreshKey = 0 }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [wallet, setWallet] = useState(null)
  const [txns, setTxns] = useState([])
  const [limit, setLimit] = useState(30)

  const currency = wallet?.currency || "XAF"
  const visibleTxns = useMemo(() => (txns || []).slice(0, limit), [txns, limit])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const [w, t] = await Promise.all([
          getStudentWallet(studentId),
          getStudentWalletTransactions(studentId),
        ])
        if (!mounted) return
        setWallet(w)
        setTxns(t || [])
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.detail || "Failed to load wallet.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [studentId, refreshKey])

  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />

  if (error) {
    return (
      <Alert className="rounded-2xl">
        <AlertDescription className="text-destructive">{error}</AlertDescription>
      </Alert>
    )
  }

  const buckets = wallet?.buckets || []
  const getBal = (type) => buckets.find((b) => b.bucket_type === type)?.balance

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#34E3CC]/15 via-[#4F9DFF]/10 to-[#7C5ADE]/15 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wallet className="h-5 w-5" />
              Wallet
            </CardTitle>
            <CardDescription>Balances and ledger activity</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            {currency}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} title="DAILY" value={money(getBal("DAILY"), currency)} />
        <StatCard icon={PiggyBank} title="SAVINGS" value={money(getBal("SAVINGS"), currency)} />
        <StatCard icon={Receipt} title="BILLS" value={money(getBal("BILLS"), currency)} />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Transactions
          </CardTitle>
          <CardDescription>Latest wallet transactions</CardDescription>
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
                  <TableCell className="text-right font-medium">{money(t.amount, currency)}</TableCell>
                </TableRow>
              ))}

              {(!visibleTxns || visibleTxns.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No transactions.
                  </TableCell>
                </TableRow>
              )}
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