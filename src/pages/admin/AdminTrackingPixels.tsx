import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTrackingPixels,
  createTrackingPixel,
  updateTrackingPixel,
  deleteTrackingPixel,
  type TrackingPixel,
  type PixelPlatform,
} from "@/lib/tracking-pixels";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Activity } from "lucide-react";
import { toast } from "sonner";

const PLATFORM_LABELS: Record<PixelPlatform, string> = {
  facebook: "Facebook Pixel",
  tiktok: "TikTok Pixel",
};

const PLATFORM_COLORS: Record<PixelPlatform, string> = {
  facebook: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  tiktok: "bg-pink-500/15 text-pink-700 border-pink-500/30",
};

export default function AdminTrackingPixels() {
  const queryClient = useQueryClient();
  const { data: pixels, isLoading } = useQuery({
    queryKey: ["tracking-pixels"],
    queryFn: fetchTrackingPixels,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TrackingPixel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [platform, setPlatform] = useState<PixelPlatform>("facebook");
  const [pixelId, setPixelId] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const createMut = useMutation({
    mutationFn: createTrackingPixel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-pixels"] });
      toast.success("تم إضافة البكسل");
      closeDialog();
    },
    onError: () => toast.error("فشل في إضافة البكسل"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...rest }: { id: string } & Parameters<typeof updateTrackingPixel>[1]) =>
      updateTrackingPixel(id, rest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-pixels"] });
      queryClient.invalidateQueries({ queryKey: ["active-tracking-pixels"] });
      toast.success("تم تحديث البكسل");
      closeDialog();
    },
    onError: () => toast.error("فشل في تحديث البكسل"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteTrackingPixel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-pixels"] });
      queryClient.invalidateQueries({ queryKey: ["active-tracking-pixels"] });
      toast.success("تم حذف البكسل");
      setDeleteId(null);
    },
    onError: () => toast.error("فشل في حذف البكسل"),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateTrackingPixel(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-pixels"] });
      queryClient.invalidateQueries({ queryKey: ["active-tracking-pixels"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setPlatform("facebook");
    setPixelId("");
    setName("");
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (p: TrackingPixel) => {
    setEditing(p);
    setPlatform(p.platform);
    setPixelId(p.pixel_id);
    setName(p.name);
    setIsActive(p.is_active);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSave = () => {
    if (!pixelId.trim()) {
      toast.error("معرف البكسل مطلوب");
      return;
    }
    if (editing) {
      updateMut.mutate({ id: editing.id, platform, pixel_id: pixelId.trim(), name: name.trim(), is_active: isActive });
    } else {
      createMut.mutate({ platform, pixel_id: pixelId.trim(), name: name.trim() || undefined, is_active: isActive });
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="بكسلات التتبع"
        description="إدارة بكسلات Facebook و TikTok لمتجرك"
      >
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" /> إضافة بكسل
        </Button>
      </AdminPageHeader>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">جاري التحميل…</div>
          ) : !pixels?.length ? (
            <div className="text-center py-16 space-y-3">
              <Activity className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">لم يتم إعداد بكسلات تتبع</p>
              <Button variant="outline" size="sm" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-1" /> أضف أول بكسل
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنصة</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>معرف البكسل</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pixels.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Badge variant="outline" className={PLATFORM_COLORS[p.platform]}>
                        {PLATFORM_LABELS[p.platform]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{p.name || "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.pixel_id}</TableCell>
                    <TableCell>
                      <Switch
                        checked={p.is_active}
                        onCheckedChange={(checked) => toggleMut.mutate({ id: p.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل البكسل" : "إضافة بكسل تتبع"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>المنصة</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as PixelPlatform)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook Pixel</SelectItem>
                  <SelectItem value="tiktok">TikTok Pixel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>معرف البكسل *</Label>
              <Input
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder={platform === "facebook" ? "123456789012345" : "CXXXXXXXXXXXXXXXXX"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الاسم (اختياري)</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: بكسل المتجر الرئيسي"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>إلغاء</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {editing ? "حفظ التغييرات" : "إضافة البكسل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف البكسل؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف بكسل التتبع هذا نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMut.mutate(deleteId)}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}