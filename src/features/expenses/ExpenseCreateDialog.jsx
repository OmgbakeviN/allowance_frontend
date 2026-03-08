import { useEffect, useMemo, useState } from "react"

import { createExpense, getCategories } from "@/features/expenses/expensesService"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CircleDollarSign, Image, NotebookPen, Plus, Receipt, Save, Tag, Wallet } from "lucide-react"

const BUCKETS = ["DAILY", "BILLS", "SAVINGS"]

export default function ExpenseCreateDialog({ onCreated }) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(false)

  const [amount, setAmount] = useState("")
  const [bucketType, setBucketType] = useState("DAILY")
  const [categoryId, setCategoryId] = useState("")
  const [note, setNote] = useState("")
  const [receipt, setReceipt] = useState(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const sortedCats = useMemo(() => {
    return [...categories].sort((a, b) => {
      if (a.is_default !== b.is_default) return a.is_default ? -1 : 1
      return (a.name || "").localeCompare(b.name || "")
    })
  }, [categories])

  const loadCats = async () => {
    setLoadingCats(true)
    try {
      const data = await getCategories()
      setCategories(data || [])
      const other = (data || []).find((c) => c.slug === "other")
      if (other && !categoryId) setCategoryId(String(other.id))
    } finally {
      setLoadingCats(false)
    }
  }

  useEffect(() => {
    if (open) loadCats()
  }, [open])

  const reset = () => {
    setAmount("")
    setBucketType("DAILY")
    setNote("")
    setReceipt(null)
    setError("")
  }

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      const payload = {
        amount,
        bucket_type: bucketType,
        category_id: categoryId ? Number(categoryId) : undefined,
        note,
        receipt,
      }
      await createExpense(payload)
      setOpen(false)
      reset()
      onCreated?.()
    } catch (err) {
      const d = err?.response?.data
      const msg =
        d?.amount?.[0] ||
        d?.category?.[0] ||
        d?.detail ||
        "Erreur lors de l’enregistrement."
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setError("")
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add expense
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            New expense
          </DialogTitle>
          <DialogDescription>Record an expense and update your wallet automatically.</DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert className="rounded-2xl">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                Amount
              </Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1500"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Bucket
              </Label>
              <Select value={bucketType} onValueChange={setBucketType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select bucket" />
                </SelectTrigger>
                <SelectContent>
                  {BUCKETS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={loadingCats}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={loadingCats ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {sortedCats.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.is_default ? c.name : `${c.name} (custom)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-muted-foreground" />
              Note
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lunch, taxi, data bundle..."
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4 text-muted-foreground" />
              Receipt
            </Label>
            <Input
              type="file"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Optional proof of purchase.</p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpen(false)
                reset()
              }}
              className="rounded-xl"
            >
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