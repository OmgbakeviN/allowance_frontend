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
import { BadgePercent, CalendarDays, Receipt, Save } from "lucide-react"

export default function BillFormDialog({
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

  const [billTitle, setBillTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [priority, setPriority] = useState("1")
  const [mandatory, setMandatory] = useState("true")

  useEffect(() => {
    if (!open) return
    setError("")
    setBillTitle(initial?.title || "")
    setAmount(initial?.amount ?? "")
    setDueDay(initial?.due_day ?? "")
    setPriority(String(initial?.priority ?? 1))
    setMandatory(String(initial?.is_mandatory ?? true))
  }, [open, initial])

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      const payload = {
        title: billTitle.trim(),
        amount: String(amount),
        priority: Number(priority || 1),
        is_mandatory: mandatory === "true",
      }
      if (dueDay !== "" && dueDay !== null && dueDay !== undefined) payload.due_day = Number(dueDay)

      await onSubmit(payload)
      setOpen(false)
    } catch (err) {
      const d = err?.response?.data
      const msg =
        d?.title?.[0] ||
        d?.amount?.[0] ||
        d?.due_day?.[0] ||
        d?.priority?.[0] ||
        d?.detail ||
        "Failed to save bill."
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="gap-2 rounded-xl">
          <Receipt className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
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
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Title
            </Label>
            <Input
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
              placeholder="Rent"
              required
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Amount
              </Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="30000"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Due day
              </Label>
              <Input
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                placeholder="5"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BadgePercent className="h-4 w-4 text-muted-foreground" />
                Priority
              </Label>
              <Input
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="1"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Mandatory
              </Label>
              <Select value={mandatory} onValueChange={setMandatory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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