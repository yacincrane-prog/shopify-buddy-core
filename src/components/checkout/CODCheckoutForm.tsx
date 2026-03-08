import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { WILAYAS } from "@/data/algeria";
import { useActiveShippingRates, type ShippingRate } from "@/hooks/useShippingRates";
import { useCheckoutConfig, DEFAULT_CONFIG, type CheckoutField } from "@/hooks/useCheckoutConfig";
import { createOrder } from "@/lib/orders";
import { Loader2, Truck, Building2, CheckCircle2, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import { PostOrderUpsellPage } from "@/components/checkout/PostOrderUpsellPage";
import type { Product } from "@/types/product";
import { useAbandonedLeadCapture } from "@/hooks/useAbandonedLeadCapture";
import { useTrackingPixels } from "@/hooks/useTrackingPixels";
import { Textarea } from "@/components/ui/textarea";
import {
  validateDiscountCode,
  calculateDiscount,
  incrementDiscountUsage,
  type DiscountCode,
} from "@/lib/discount-codes";

interface UpsellItem {
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
}

interface CODCheckoutFormProps {
  product: Product;
  quantity: number;
  unitPrice?: number;
  upsellItem?: UpsellItem | null;
  freeDelivery?: boolean;
}

type CheckoutPhase = "form" | "post-upsell" | "confirmed";

export function CODCheckoutForm({ product, quantity, unitPrice, upsellItem, freeDelivery = false }: CODCheckoutFormProps) {
  const { data: shippingRates } = useActiveShippingRates();
  const { data: checkoutConfig } = useCheckoutConfig();
  const config = checkoutConfig ?? DEFAULT_CONFIG;
  const { trackEvent } = useTrackingPixels();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "stop_desk">("home");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<CheckoutPhase>("form");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);

  const visibleFields = config.fields.filter((f) => f.visible).sort((a, b) => a.position - b.position);
  const getField = (id: string) => config.fields.find((f) => f.id === id);
  const isFieldVisible = (id: string) => getField(id)?.visible !== false;

  const getWilayaByCode = (code: string) => WILAYAS.find((w) => w.code === code);
  const getShippingRate = (code: string): ShippingRate | undefined =>
    shippingRates?.find((r) => r.wilaya_code === code);

  const getLeadData = useCallback(() => ({
    product_id: product.id,
    product_title: product.title,
    customer_name: name,
    customer_phone: phone,
    wilaya: wilayaCode ? (getWilayaByCode(wilayaCode)?.name ?? "") : "",
    commune,
  }), [product.id, product.title, name, phone, wilayaCode, commune]);

  useAbandonedLeadCapture(getLeadData, phone.trim().length >= 5, phase !== "form");

  const effectiveUnitPrice = unitPrice ?? Number(product.price);
  const productTotal = effectiveUnitPrice * quantity;
  const upsellTotal = upsellItem ? upsellItem.discountedPrice * upsellItem.quantity : 0;

  useEffect(() => {
    trackEvent("InitiateCheckout", {
      content_name: product.title,
      content_ids: [product.id],
      value: effectiveUnitPrice * quantity,
      currency: "DZD",
    });
  }, []);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [postUpsellExtra, setPostUpsellExtra] = useState(0);

  const selectedWilaya = useMemo(() => getWilayaByCode(wilayaCode), [wilayaCode]);
  const selectedRate = useMemo(() => getShippingRate(wilayaCode), [wilayaCode, shippingRates]);
  const communes = selectedWilaya?.communes ?? [];

  // Use DB rate if available, otherwise fall back to hardcoded
  const shippingPrice = freeDelivery
    ? 0
    : selectedRate
      ? (deliveryType === "home" ? selectedRate.home_delivery_price : selectedRate.stop_desk_price)
      : (selectedWilaya ? (deliveryType === "home" ? selectedWilaya.homeDelivery : selectedWilaya.stopDesk) : 0);

  const stopDeskEnabled = selectedRate ? selectedRate.stop_desk_enabled : true;

  // Filter wilayas to only show active ones from DB
  const activeWilayas = useMemo(() => {
    if (!shippingRates) return WILAYAS;
    const activeCodes = new Set(shippingRates.map((r) => r.wilaya_code));
    return WILAYAS.filter((w) => activeCodes.has(w.code));
  }, [shippingRates]);

  const subtotalBeforeDiscount = productTotal + upsellTotal;
  const discountAmount = appliedDiscount ? calculateDiscount(appliedDiscount, subtotalBeforeDiscount) : 0;
  const totalPrice = subtotalBeforeDiscount - discountAmount + shippingPrice;

  const handleWilayaChange = (code: string) => {
    setWilayaCode(code);
    setCommune("");
    // Auto-switch to home if stop desk not available
    const rate = shippingRates?.find((r) => r.wilaya_code === code);
    if (rate && !rate.stop_desk_enabled && deliveryType === "stop_desk") {
      setDeliveryType("home");
    }
  };

  const isValid = name.trim().length >= 3 && phone.trim().length >= 9 && wilayaCode && commune;

  const handleApplyDiscount = async () => {
    const trimmed = discountInput.trim();
    if (!trimmed) { setDiscountError("أدخل كود الخصم"); return; }
    if (trimmed.length > 30) { setDiscountError("كود غير صالح"); return; }

    setValidatingCode(true);
    setDiscountError("");
    try {
      const result = await validateDiscountCode(trimmed, subtotalBeforeDiscount);
      if (result.valid && result.discount) {
        setAppliedDiscount(result.discount);
        setDiscountError("");
        toast.success("تم تطبيق الخصم!");
      } else {
        setDiscountError(result.error || "كود غير صالح");
      }
    } catch {
      setDiscountError("خطأ في التحقق من الكود");
    } finally {
      setValidatingCode(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountInput("");
    setDiscountError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("يرجى ملء جميع الحقول بشكل صحيح");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        product_id: product.id,
        product_title: product.title + (upsellItem ? ` + ${upsellItem.title} (upsell)` : ""),
        product_price: effectiveUnitPrice,
        quantity,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        wilaya: selectedWilaya!.name,
        commune,
        delivery_type: deliveryType,
        shipping_price: shippingPrice,
        total_price: totalPrice,
        ...(appliedDiscount ? {
          discount_code: appliedDiscount.code,
          discount_amount: discountAmount,
        } : {}),
      });
      setOrderId(order.id);

      if (appliedDiscount) {
        incrementDiscountUsage(appliedDiscount.id).catch(() => {});
      }

      trackEvent("Purchase", {
        content_name: product.title,
        content_ids: [product.id],
        value: totalPrice,
        currency: "DZD",
        num_items: quantity,
      });

      setPhase("post-upsell");
    } catch {
      toast.error("فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostUpsellComplete = (addedPrice: number | null) => {
    if (addedPrice) {
      setPostUpsellExtra(addedPrice);
    }
    setPhase("confirmed");
    toast.success("تم تأكيد طلبك بنجاح!");
  };

  if (phase === "post-upsell" && orderId) {
    return (
      <PostOrderUpsellPage
        orderId={orderId}
        sourceProductId={product.id}
        onComplete={handlePostUpsellComplete}
      />
    );
  }

  if (phase === "confirmed") {
    const finalTotal = totalPrice + postUpsellExtra;
    return (
      <Card className="border-border" dir="rtl">
        <CardContent className="py-10 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
          <h3 className="text-xl font-semibold">{config.successTitle}</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {config.successMessage}
          </p>
          <div className="bg-secondary rounded-lg p-3 text-sm inline-block">
            المجموع: <span className="font-bold">{finalTotal.toLocaleString()} د.ج</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border" dir="rtl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{config.formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dynamic fields */}
          {visibleFields.map((field, idx) => {
            const showSeparator = idx > 0 && (
              (field.type === "wilaya" && visibleFields[idx - 1]?.type !== "wilaya") ||
              (field.type === "delivery_type" && visibleFields[idx - 1]?.type !== "delivery_type") ||
              (!["wilaya", "commune", "delivery_type"].includes(field.type) && ["wilaya", "commune", "delivery_type"].includes(visibleFields[idx - 1]?.type))
            );

            return (
              <div key={field.id}>
                {showSeparator && <Separator className="mb-4 sm:mb-5" />}
                {renderFormField(field)}
              </div>
            );
          })}

          {config.showDiscountCode && (
            <>
              <Separator />
              {/* Discount Code */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5" /> كود الخصم
                </Label>
                {appliedDiscount ? (
                  <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent text-accent-foreground font-mono text-xs">
                        {appliedDiscount.code}
                      </Badge>
                      <span className="text-sm text-accent font-medium">
                        -{appliedDiscount.discount_type === "percentage"
                          ? `${appliedDiscount.discount_value}%`
                          : `${appliedDiscount.discount_value.toLocaleString()} د.ج`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={discountInput}
                      onChange={(e) => { setDiscountInput(e.target.value.toUpperCase()); setDiscountError(""); }}
                      placeholder="أدخل الكود"
                      className="font-mono uppercase flex-1"
                      maxLength={30}
                      dir="ltr"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyDiscount}
                      disabled={validatingCode || !discountInput.trim()}
                      className="shrink-0"
                    >
                      {validatingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : "تطبيق"}
                    </Button>
                  </div>
                )}
                {discountError && (
                  <p className="text-xs text-destructive">{discountError}</p>
                )}
              </div>
            </>
          )}

          {config.showPriceBreakdown && (
            <>
              <Separator />
              {/* Price breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{product.title} × {quantity}</span>
                  <span>{productTotal.toLocaleString()} د.ج</span>
                </div>
                {upsellItem && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      {upsellItem.title}
                      <Badge variant="secondary" className="text-xs mr-1">عرض إضافي</Badge>
                    </span>
                    <span>{upsellTotal.toLocaleString()} د.ج</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span className="flex items-center gap-1">
                      خصم
                      <Badge variant="outline" className="text-xs font-mono border-accent/30 text-accent">
                        {appliedDiscount?.code}
                      </Badge>
                    </span>
                    <span>-{discountAmount.toLocaleString()} د.ج</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التوصيل</span>
                  <span>{freeDelivery ? "مجاني" : (shippingPrice ? `${shippingPrice.toLocaleString()} د.ج` : "—")}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>المجموع</span>
                  <span>{totalPrice.toLocaleString()} د.ج</span>
                </div>
              </div>
            </>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={!isValid || submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            {config.buttonText} — {totalPrice.toLocaleString()} د.ج
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  function renderFormField(field: CheckoutField) {
    switch (field.type) {
      case "wilaya":
        return (
          <div className="space-y-1.5">
            <Label className="text-sm">{field.label}</Label>
            <Select value={wilayaCode} onValueChange={handleWilayaChange}>
              <SelectTrigger><SelectValue placeholder={field.placeholder || "اختر الولاية"} /></SelectTrigger>
              <SelectContent className="max-h-60">
                {activeWilayas.map((w) => (
                  <SelectItem key={w.code} value={w.code}>{w.code} - {w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "commune":
        return (
          <div className="space-y-1.5">
            <Label className="text-sm">{field.label}</Label>
            <Select value={commune} onValueChange={setCommune} disabled={!communes.length}>
              <SelectTrigger><SelectValue placeholder={communes.length ? (field.placeholder || "اختر البلدية") : "اختر الولاية أولاً"} /></SelectTrigger>
              <SelectContent className="max-h-60">
                {communes.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "delivery_type":
        return (
          <div className="space-y-2">
            <Label className="text-sm">{field.label}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType("home")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors text-right text-sm ${
                  deliveryType === "home" ? "border-accent bg-accent/10" : "border-border hover:border-muted-foreground"
                }`}
              >
                <Truck className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">المنزل</p>
                  {selectedRate && (
                    <p className="text-xs text-muted-foreground">
                      {freeDelivery ? "مجاني" : `${selectedRate.home_delivery_price} د.ج`}
                    </p>
                  )}
                </div>
              </button>
              {stopDeskEnabled && (
                <button
                  type="button"
                  onClick={() => setDeliveryType("stop_desk")}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors text-right text-sm ${
                    deliveryType === "stop_desk" ? "border-accent bg-accent/10" : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">المكتب</p>
                    {selectedRate && (
                      <p className="text-xs text-muted-foreground">
                        {freeDelivery ? "مجاني" : `${selectedRate.stop_desk_price} د.ج`}
                      </p>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        );
      case "textarea":
        return (
          <div className="space-y-1.5">
            <Label className="text-sm">{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
            <Textarea
              value={customFields[field.id] ?? ""}
              onChange={(e) => setCustomFields((prev) => ({ ...prev, [field.id]: e.target.value }))}
              placeholder={field.placeholder}
              rows={2}
            />
          </div>
        );
      case "tel":
        if (field.id === "phone") {
          return (
            <div className="space-y-1.5">
              <Label className="text-sm">{field.label}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={field.placeholder} type="tel" autoComplete="tel" dir="ltr" />
            </div>
          );
        }
        return (
          <div className="space-y-1.5">
            <Label className="text-sm">{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
            <Input
              value={customFields[field.id] ?? ""}
              onChange={(e) => setCustomFields((prev) => ({ ...prev, [field.id]: e.target.value }))}
              placeholder={field.placeholder}
              type="tel"
              dir="ltr"
            />
          </div>
        );
      default: // text, email
        if (field.id === "name") {
          return (
            <div className="space-y-1.5">
              <Label className="text-sm">{field.label}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={field.placeholder} autoComplete="name" />
            </div>
          );
        }
        return (
          <div className="space-y-1.5">
            <Label className="text-sm">{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
            <Input
              value={customFields[field.id] ?? ""}
              onChange={(e) => setCustomFields((prev) => ({ ...prev, [field.id]: e.target.value }))}
              placeholder={field.placeholder}
              type={field.type}
              dir={field.type === "email" ? "ltr" : undefined}
            />
          </div>
        );
    }
  }
}
