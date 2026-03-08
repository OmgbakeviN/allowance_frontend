import { useState } from "react"
import { createDeposit } from "@/features/wallet/walletService"
import { money } from "@/lib/format"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ArrowDownCircle,
  CheckCircle2,
  FileText,
  Landmark,
  PiggyBank,
  Receipt,
  Wallet,
} from "lucide-react"

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

function TxnIcon({ bucket }) {
  if (bucket === "DAILY") return <Wallet className="h-4 w-4" />
  if (bucket === "SAVINGS") return <PiggyBank className="h-4 w-4" />
  return <Receipt className="h-4 w-4" />
}

export default function DepositDialog({ studentId, currency = "XAF", onDeposited }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [externalRef, setExternalRef] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)

  const reset = () => {
    setAmount("")
    setDescription("")
    setExternalRef("")
    setError("")
    setResult(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        student_id: Number(studentId),
        amount: String(amount),
      }
      if (description?.trim()) payload.description = description.trim()
      if (externalRef?.trim()) payload.external_ref = externalRef.trim()

      const res = await createDeposit(payload)
      setResult(res)
      onDeposited?.()
    } catch (err) {
      const d = err?.response?.data
      setError(d?.detail || d?.non_field_errors?.[0] || "Deposit failed.")
    } finally {
      setLoading(false)
    }
  }

  const txns = result?.transactions || []
  const billsTxn = txns.find((t) => t.bucket_type === "BILLS")
  const breakdown = billsTxn?.metadata?.bills_breakdown || []

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl">
          <ArrowDownCircle className="h-4 w-4" />
          Deposit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Deposit to student
          </DialogTitle>
          <DialogDescription>
            Money is auto-allocated using the active plan: Bills → Savings → Daily.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert className="rounded-2xl">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        ) : null}

        {!result ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Amount
              </Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                required
                className="rounded-xl"
              />
              <div className="text-xs text-muted-foreground">Currency: {currency}</div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Allowance February"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                External ref
              </Label>
              <Input
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder="DEP-0007"
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 rounded-xl">
                <ArrowDownCircle className="h-4 w-4" />
                {loading ? "Sending..." : "Send deposit"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="rounded-2xl">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Deposit created successfully. Allocation completed.</AlertDescription>
            </Alert>

            <div className="rounded-2xl border p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Wallet className="h-4 w-4" />
                Created transactions
              </div>

              <div className="space-y-2">
                {txns.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-xl border p-3">
                    <div className="flex items-center gap-2">
                      <TxnIcon bucket={t.bucket_type} />
                      <BucketBadge value={t.bucket_type} />
                    </div>
                    <div className="font-medium">{money(t.amount, currency)}</div>
                  </div>
                ))}
              </div>
            </div>

            {breakdown.length ? (
              <div className="rounded-2xl border p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Receipt className="h-4 w-4" />
                  Bills breakdown
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill</TableHead>
                        <TableHead className="text-right">Need</TableHead>
                        <TableHead className="text-right">Allocated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.map((b) => (
                        <TableRow key={b.bill_id}>
                          <TableCell>{b.title}</TableCell>
                          <TableCell className="text-right">{money(b.need, currency)}</TableCell>
                          <TableCell className="text-right font-medium">{money(b.allocated, currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}

            <DialogFooter className="gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)} className="rounded-xl">
                Close
              </Button>
              <Button
                className="gap-2 rounded-xl"
                onClick={() => {
                  setResult(null)
                  setError("")
                }}
              >
                <ArrowDownCircle className="h-4 w-4" />
                New deposit
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}