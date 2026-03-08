import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  useGoogleSheetsConfig,
  useSaveGoogleSheetsConfig,
  useExportOrders,
  useTestConnection,
} from "@/hooks/useGoogleSheets";
import {
  CheckCircle2, XCircle, Upload, FlaskConical, GripVertical,
  Link2, FileSpreadsheet, ArrowUpDown, Loader2,
} from "lucide-react";

const COLUMN_LABELS: Record<string, string> = {
  date: "التاريخ",
  product_name: "اسم المنتج",
  quantity: "الكمية",
  customer_name: "اسم العميل",
  phone: "الهاتف",
  wilaya: "الولاية",
  commune: "البلدية",
  delivery_type: "نوع التوصيل",
  shipping_price: "سعر الشحن",
  total_price: "السعر الإجمالي",
  status: "حالة الطلب",
};

const DEFAULT_COLUMNS = Object.keys(COLUMN_LABELS);

export default function AdminGoogleSheets() {
  const { data: config, isLoading } = useGoogleSheetsConfig();
  const saveConfig = useSaveGoogleSheetsConfig();
  const exportOrders = useExportOrders();
  const testConnection = useTestConnection();

  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);

  useEffect(() => {
    if (config) {
      setSheetUrl(config.sheet_url || "");
      setSheetName(config.sheet_name || "");
      setWebhookUrl(config.webhook_url || "");
      setColumns((config.column_mapping as string[]) || DEFAULT_COLUMNS);
    }
  }, [config]);

  const isConnected = config?.is_active && config?.webhook_url;

  const handleConnect = () => {
    if (!config) return;
    saveConfig.mutate({
      id: config.id,
      sheet_url: sheetUrl,
      sheet_name: sheetName,
      webhook_url: webhookUrl,
      is_active: true,
    });
  };

  const handleDisconnect = () => {
    if (!config) return;
    saveConfig.mutate({ id: config.id, is_active: false });
  };

  const handleSaveColumns = () => {
    if (!config) return;
    saveConfig.mutate({ id: config.id, column_mapping: columns as any });
  };

  const moveColumn = (idx: number, dir: -1 | 1) => {
    const next = [...columns];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setColumns(next);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Google Sheets Integration"
        description="اربط متجرك بـ Google Sheets لتصدير الطلبات تلقائياً"
      />

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            حالة الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">الحالة</p>
              {isConnected ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> متصل
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" /> غير متصل
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">اسم الورقة</p>
              <p className="text-sm font-medium">{config?.sheet_name || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">آخر تصدير</p>
              <p className="text-sm font-medium">
                {config?.last_export_at
                  ? new Date(config.last_export_at).toLocaleDateString("ar-DZ")
                  : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">إجمالي المصدّر</p>
              <p className="text-sm font-medium">{config?.total_exported ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            إعداد الاتصال
          </CardTitle>
          <CardDescription>
            أدخل رابط Webhook (مثل Make.com أو Zapier) لإرسال الطلبات تلقائياً
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>رابط Google Sheet</Label>
            <Input
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>اسم الورقة (Tab)</Label>
            <Input
              placeholder="Sheet1"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>رابط Webhook</Label>
            <Input
              placeholder="https://hook.eu2.make.com/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={!webhookUrl || saveConfig.isPending}>
              {saveConfig.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isConnected ? "تحديث الاتصال" : "ربط الورقة"}
            </Button>
            {isConnected && (
              <Button variant="outline" onClick={handleDisconnect} disabled={saveConfig.isPending}>
                قطع الاتصال
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Column Order */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            ترتيب الأعمدة
          </CardTitle>
          <CardDescription>اسحب لإعادة ترتيب الأعمدة التي يتم تصديرها</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {columns.map((col, idx) => (
            <div
              key={col}
              className="flex items-center gap-2 p-2 rounded-md border bg-muted/30"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{COLUMN_LABELS[col] || col}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => moveColumn(idx, -1)}
                disabled={idx === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => moveColumn(idx, 1)}
                disabled={idx === columns.length - 1}
              >
                ↓
              </Button>
            </div>
          ))}
          <Button variant="secondary" onClick={handleSaveColumns} disabled={saveConfig.isPending} className="mt-2">
            حفظ الترتيب
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أدوات التصدير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => testConnection.mutate()}
              disabled={!isConnected || testConnection.isPending}
              variant="outline"
            >
              {testConnection.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FlaskConical className="h-4 w-4" />
              )}
              اختبار الاتصال
            </Button>
            <Button
              onClick={() => exportOrders.mutate(undefined)}
              disabled={!isConnected || exportOrders.isPending}
            >
              {exportOrders.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              تصدير الطلبات الجديدة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
