import { useEffect, useMemo, useState } from "react"
import { money } from "@/lib/format"
import { getStudentWallet, getStudentWalletTransactions } from "@/features/wallet/walletService"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

function fmt(dt) {
  if (!dt) return "-"
  const d = new Date(dt)
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString("fr-FR")
}

export default function ParentStudentWalletTab({ studentId }) {
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
  }, [studentId])

  if (loading) return <Skeleton className="h-40 w-full" />

  if (error) {
    return (
      <Alert>
        <AlertDescription className="text-destructive">{error}</AlertDescription>
      </Alert>
    )
  }

  const buckets = wallet?.buckets || []
  const getBal = (type) => buckets.find((b) => b.bucket_type === type)?.balance

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Balances + ledger transactions</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground">DAILY</div>
            <div className="text-xl font-semibold">{money(getBal("DAILY"), currency)}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground">SAVINGS</div>
            <div className="text-xl font-semibold">{money(getBal("SAVINGS"), currency)}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-sm text-muted-foreground">BILLS</div>
            <div className="text-xl font-semibold">{money(getBal("BILLS"), currency)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
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
                    <Badge variant="outline">{t.bucket_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t.txn_type}</Badge>
                  </TableCell>
                  <TableCell>{t.direction}</TableCell>
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