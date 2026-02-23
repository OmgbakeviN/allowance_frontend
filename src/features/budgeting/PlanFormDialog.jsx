import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

const SAVINGS_MODES = ["NONE", "AMOUNT", "PERCENT"]

export default function PlanFormDialog({
  triggerLabel,
  title,
  description,
  initial = null,
  onSubmit,
  triggerVariant = "default",
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("XAF")
  const [dailyLimit, setDailyLimit] = useState("")
  const [savingsMode, setSavingsMode] = useState("NONE")
  const [savingsAmount, setSavingsAmount] = useState("")
  const [savingsPercent, setSavingsPercent] = useState("")

  useEffect(() => {
    if (!open) return
    setError("")
    setName(initial?.name || "My Monthly Plan")
    setCurrency(initial?.currency || "XAF")
    setDailyLimit(initial?.daily_limit ?? "")
    setSavingsMode(initial?.savings_mode || "NONE")
    setSavingsAmount(initial?.savings_amount ?? "")
    setSavingsPercent(initial?.savings_percent ?? "")
  }, [open, initial])

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const payload = {
        name: name.trim(),
        currency: (currency || "XAF").toUpperCase(),
        daily_limit: dailyLimit === "" ? "0" : String(dailyLimit),
        savings_mode: savingsMode,
      }

      if (savingsMode === "AMOUNT") {
        payload.savings_amount = savingsAmount === "" ? "0" : String(savingsAmount)
        payload.savings_percent = "0"
      } else if (savingsMode === "PERCENT") {
        payload.savings_percent = savingsPercent === "" ? "0" : String(savingsPercent)
        payload.savings_amount = "0"
      } else {
        payload.savings_amount = "0"
        payload.savings_percent = "0"
      }

      await onSubmit(payload)
      setOpen(false)
    } catch (err) {
      const d = err?.response?.data
      const msg =
        d?.name?.[0] ||
        d?.currency?.[0] ||
        d?.daily_limit?.[0] ||
        d?.savings_amount?.[0] ||
        d?.savings_percent?.[0] ||
        d?.detail ||
        "Failed to save plan."
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert>
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="XAF" />
            </div>
            <div className="space-y-2">
              <Label>Daily limit (0 = no limit)</Label>
              <Input value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} placeholder="2000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Savings mode</Label>
            <Select value={savingsMode} onValueChange={setSavingsMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {SAVINGS_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {savingsMode === "AMOUNT" ? (
            <div className="space-y-2">
              <Label>Savings amount</Label>
              <Input value={savingsAmount} onChange={(e) => setSavingsAmount(e.target.value)} placeholder="15000" />
            </div>
          ) : null}

          {savingsMode === "PERCENT" ? (
            <div className="space-y-2">
              <Label>Savings percent (0-100)</Label>
              <Input value={savingsPercent} onChange={(e) => setSavingsPercent(e.target.value)} placeholder="10" />
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}