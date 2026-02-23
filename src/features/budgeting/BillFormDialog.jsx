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
            <Label>Title</Label>
            <Input value={billTitle} onChange={(e) => setBillTitle(e.target.value)} placeholder="Rent" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="30000" required />
            </div>

            <div className="space-y-2">
              <Label>Due day (1-31, optional)</Label>
              <Input value={dueDay} onChange={(e) => setDueDay(e.target.value)} placeholder="5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority (1 = first)</Label>
              <Input value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="1" />
            </div>

            <div className="space-y-2">
              <Label>Mandatory</Label>
              <Select value={mandatory} onValueChange={setMandatory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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