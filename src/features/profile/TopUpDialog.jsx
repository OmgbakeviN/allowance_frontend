import { useState } from "react"
import { parentTopUp } from "@/features/profile/profileService"
import { money } from "@/lib/format"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowDownCircle,
  CheckCircle2,
  CreditCard,
  Landmark,
  Receipt,
  Wallet,
} from "lucide-react"

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
          Top up
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Top up balance
          </DialogTitle>
          <DialogDescription>
            Simulation MTN/Orange Money with platform fee applied.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert className="rounded-2xl">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        ) : null}

        {!result ? (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Amount
              </Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="20000"
                required
                className="rounded-xl"
              />
              <div className="text-xs text-muted-foreground">Currency: {currency}</div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Provider
              </Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTN">MTN Money</SelectItem>
                  <SelectItem value="ORANGE">Orange Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                External ref
              </Label>
              <Input
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder="TOPUP-001"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Description
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="My top up"
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 rounded-xl">
                <ArrowDownCircle className="h-4 w-4" />
                {loading ? "Processing..." : "Top up"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="rounded-2xl">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Top up completed successfully.</AlertDescription>
            </Alert>

            <div className="space-y-3 rounded-2xl border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Provider</span>
                <Badge variant="secondary" className="rounded-full">
                  {provider}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gross</span>
                <span className="font-medium">{money(txn.gross_amount, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium">{money(txn.fee_amount, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Net credited</span>
                <span className="font-semibold">{money(txn.net_amount, currency)}</span>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)} className="rounded-xl">
                Close
              </Button>
              <Button onClick={() => setResult(null)} className="rounded-xl">
                New top up
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}