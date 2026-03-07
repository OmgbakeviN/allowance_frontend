import { useState } from "react"
import { parentTopUp } from "@/features/profile/profileService"
import { money } from "@/lib/format"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

export default function TopUpDialog({ currency = "XAF", onDone }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [provider, setProvider] = useState("MTN")
  const [externalRef, setExternalRef] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)

  const reset = () => {
    setAmount("")
    setProvider("MTN")
    setExternalRef("")
    setDescription("")
    setError("")
    setResult(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const payload = {
        amount: String(amount),
        provider,
      }
      if (externalRef.trim()) payload.external_ref = externalRef.trim()
      if (description.trim()) payload.description = description.trim()

      const res = await parentTopUp(payload)
      setResult(res)
      onDone?.()
    } catch (err) {
      const d = err?.response?.data
      setError(d?.detail || d?.amount?.[0] || "Top up failed.")
    } finally {
      setLoading(false)
    }
  }

  const txn = result?.transaction

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button>Top up (simulation)</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Top up</DialogTitle>
          <DialogDescription>Simulation MTN/Orange Money (fee applied).</DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert>
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        ) : null}

        {!result ? (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="20000" required />
              <div className="text-xs text-muted-foreground">Currency: {currency}</div>
            </div>

            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTN">MTN Money</SelectItem>
                  <SelectItem value="ORANGE">Orange Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>External ref (optional)</Label>
              <Input value={externalRef} onChange={(e) => setExternalRef(e.target.value)} placeholder="TOPUP-001" />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="My topup" />
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "..." : "Top up"}</Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-3">
            <Alert>
              <AlertDescription>✅ Top up done.</AlertDescription>
            </Alert>

            <div className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Gross</span><span className="font-medium">{money(txn.gross_amount, currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span className="font-medium">{money(txn.fee_amount, currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Net credited</span><span className="font-medium">{money(txn.net_amount, currency)}</span></div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
              <Button onClick={() => setResult(null)}>New top up</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}