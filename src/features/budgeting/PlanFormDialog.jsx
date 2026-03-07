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
import { CircleDollarSign, PiggyBank, Save, Settings2, Wallet } from "lucide-react"

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
        <Button variant={triggerVariant} className="gap-2 rounded-xl">
          <Settings2 className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert className="rounded-2xl">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              Name
            </Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
              Savings mode
            </Label>
            <Select value={savingsMode} onValueChange={setSavingsMode}>
              <SelectTrigger className="rounded-xl">
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
              <Label className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
                Savings amount
              </Label>
              <Input
                value={savingsAmount}
                onChange={(e) => setSavingsAmount(e.target.value)}
                placeholder="15000"
                className="rounded-xl"
              />
            </div>
          ) : null}

          {savingsMode === "PERCENT" ? (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
                Savings percent
              </Label>
              <Input
                value={savingsPercent}
                onChange={(e) => setSavingsPercent(e.target.value)}
                placeholder="10"
                className="rounded-xl"
              />
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2 rounded-xl">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}