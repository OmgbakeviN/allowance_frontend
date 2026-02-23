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
        <Button>Deposit</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Deposit to student</DialogTitle>
          <DialogDescription>
            Money will be auto-allocated using the student active plan (Bills → Savings → Daily).
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert>
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        ) : null}

        {!result ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10000" required />
              <div className="text-xs text-muted-foreground">Currency: {currency}</div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Allowance February" />
            </div>

            <div className="space-y-2">
              <Label>External ref (optional)</Label>
              <Input value={externalRef} onChange={(e) => setExternalRef(e.target.value)} placeholder="DEP-0007" />
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send deposit"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>✅ Deposit created. Allocation done.</AlertDescription>
            </Alert>

            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground mb-2">Created transactions</div>
              <div className="space-y-1 text-sm">
                {txns.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="text-muted-foreground">{t.bucket_type}</div>
                    <div className="font-medium">{money(t.amount, currency)}</div>
                  </div>
                ))}
              </div>
            </div>

            {breakdown.length ? (
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium mb-2">Bills breakdown</div>
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
                          <TableCell className="text-right">{money(b.allocated, currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setResult(null)
                  setError("")
                }}
              >
                New deposit
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}