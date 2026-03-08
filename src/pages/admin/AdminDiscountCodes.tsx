import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  type DiscountCode,
  type DiscountType,
} from "@/lib/discount-codes";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Ticket, Copy } from "lucide-react";
import { toast } from "sonner";

export default function AdminDiscountCodes() {
  const queryClient = useQueryClient();
  const { data: codes, isLoading } = useQuery({
    queryKey: ["discount-codes"],
    queryFn: fetchDiscountCodes,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["discount-codes"] });
  };

  const createMut = useMutation({
    mutationFn: createDiscountCode,
    onSuccess: () => { invalidate(); toast.success("Discount code created"); closeDialog(); },
    onError: (e: any) => toast.error(e?.message?.includes("duplicate") ? "Code already exists" : "Failed to create"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...rest }: { id: string } & Parameters<typeof updateDiscountCode>[1]) =>
      updateDiscountCode(id, rest),
    onSuccess: () => { invalidate(); toast.success("Discount code updated"); closeDialog(); },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteDiscountCode,
    onSuccess: () => { invalidate(); toast.success("Deleted"); setDeleteId(null); },
    onError: () => toast.error("Failed to delete"),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateDiscountCode(id, { is_active }),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditing(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrder("");
    setMaxUses("");
    setExpiresAt("");
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (dc: DiscountCode) => {
    setEditing(dc);
    setCode(dc.code);
    setDiscountType(dc.discount_type);
    setDiscountValue(String(dc.discount_value));
    setMinOrder(dc.min_order_amount ? String(dc.min_order_amount) : "");
    setMaxUses(dc.max_uses !== null ? String(dc.max_uses) : "");
    setExpiresAt(dc.expires_at ? dc.expires_at.slice(0, 16) : "");
    setIsActive(dc.is_active);
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const handleSave = () => {
    const trimmedCode = code.toUpperCase().trim();
    if (!trimmedCode) { toast.error("Code is required"); return; }
    if (trimmedCode.length < 3 || trimmedCode.length > 30) { toast.error("Code must be 3-30 characters"); return; }
    if (!/^[A-Z0-9_-]+$/.test(trimmedCode)) { toast.error("Code can only contain letters, numbers, hyphens, underscores"); return; }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) { toast.error("Discount value must be positive"); return; }
    if (discountType === "percentage" && val > 100) { toast.error("Percentage can't exceed 100%"); return; }

    const payload = {
      code: trimmedCode,
      discount_type: discountType,
      discount_value: val,
      min_order_amount: minOrder ? parseFloat(minOrder) : 0,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    };

    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    toast.success("Copied!");
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  const isExpired = (dc: DiscountCode) => dc.expires_at && new Date(dc.expires_at) < new Date();
  const isMaxed = (dc: DiscountCode) => dc.max_uses !== null && dc.current_uses >= dc.max_uses;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Discount Codes"
        description="Create and manage discount codes for your store"
      >
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Code
        </Button>
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading…</div>
          ) : !codes?.length ? (
            <div className="text-center py-16 space-y-3">
              <Ticket className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">No discount codes yet</p>
              <Button variant="outline" size="sm" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-1" /> Create your first code
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((dc) => (
                  <TableRow key={dc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-sm bg-secondary px-2 py-0.5 rounded">
                          {dc.code}
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(dc.code)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {dc.discount_type === "percentage"
                        ? `${dc.discount_value}%`
                        : `${dc.discount_value.toLocaleString()} DA`}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {dc.min_order_amount > 0 ? `${dc.min_order_amount.toLocaleString()} DA` : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {dc.current_uses}{dc.max_uses !== null ? ` / ${dc.max_uses}` : ""}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dc.expires_at ? (
                        <span className={isExpired(dc) ? "text-destructive" : ""}>
                          {new Date(dc.expires_at).toLocaleDateString()}
                          {isExpired(dc) && " (expired)"}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {isExpired(dc) || isMaxed(dc) ? (
                        <Badge variant="secondary" className="text-xs">
                          {isExpired(dc) ? "Expired" : "Maxed"}
                        </Badge>
                      ) : (
                        <Switch
                          checked={dc.is_active}
                          onCheckedChange={(checked) => toggleMut.mutate({ id: dc.id, is_active: checked })}
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(dc)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(dc.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Discount Code" : "Create Discount Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SAVE20"
                maxLength={30}
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">Letters, numbers, hyphens, underscores only</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (DA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Value *</Label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "20" : "500"}
                  min="0"
                  max={discountType === "percentage" ? "100" : undefined}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Min Order (DA)</Label>
                <Input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                  min="1"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Expires At</Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {editing ? "Save Changes" : "Create Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete discount code?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this discount code.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMut.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
