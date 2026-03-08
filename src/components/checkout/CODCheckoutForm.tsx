import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { WILAYAS, getWilayaByCode, getShippingPrice } from "@/data/algeria";
import { createOrder } from "@/lib/orders";
import { Loader2, Truck, Building2, CheckCircle2, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import { PostOrderUpsellPage } from "@/components/checkout/PostOrderUpsellPage";
import type { Product } from "@/types/product";
import { useAbandonedLeadCapture } from "@/hooks/useAbandonedLeadCapture";
import { useTrackingPixels } from "@/hooks/useTrackingPixels";
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
  const { trackEvent } = useTrackingPixels();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "stop_desk">("home");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<CheckoutPhase>("form");

  // Discount code state
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);

  // Silent abandoned lead capture
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

  // Track InitiateCheckout once this form mounts
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
  const communes = selectedWilaya?.communes ?? [];
  const shippingPrice = freeDelivery ? 0 : (wilayaCode ? getShippingPrice(wilayaCode, deliveryType) : 0);

  const subtotalBeforeDiscount = productTotal + upsellTotal;
  const discountAmount = appliedDiscount ? calculateDiscount(appliedDiscount, subtotalBeforeDiscount) : 0;
  const totalPrice = subtotalBeforeDiscount - discountAmount + shippingPrice;

  const handleWilayaChange = (code: string) => {
    setWilayaCode(code);
    setCommune("");
  };

  const isValid = name.trim().length >= 3 && phone.trim().length >= 9 && wilayaCode && commune;

  // Discount code handlers
  const handleApplyDiscount = async () => {
    const trimmed = discountInput.trim();
    if (!trimmed) { setDiscountError("Enter a discount code"); return; }
    if (trimmed.length > 30) { setDiscountError("Invalid code"); return; }

    setValidatingCode(true);
    setDiscountError("");
    try {
      const result = await validateDiscountCode(trimmed, subtotalBeforeDiscount);
      if (result.valid && result.discount) {
        setAppliedDiscount(result.discount);
        setDiscountError("");
        toast.success("Discount applied!");
      } else {
        setDiscountError(result.error || "Invalid code");
      }
    } catch {
      setDiscountError("Error validating code");
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
      toast.error("Please fill all fields correctly");
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

      // Increment discount usage
      if (appliedDiscount) {
        incrementDiscountUsage(appliedDiscount.id).catch(() => {});
      }

      // Fire Purchase event for all active pixels
      trackEvent("Purchase", {
        content_name: product.title,
        content_ids: [product.id],
        value: totalPrice,
        currency: "DZD",
        num_items: quantity,
      });

      // Show post-order upsell instead of confirming immediately
      setPhase("post-upsell");
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostUpsellComplete = (addedPrice: number | null) => {
    if (addedPrice) {
      setPostUpsellExtra(addedPrice);
    }
    setPhase("confirmed");
    toast.success("Order placed successfully!");
  };

  // Post-order upsell phase
  if (phase === "post-upsell" && orderId) {
    return (
      <PostOrderUpsellPage
        orderId={orderId}
        sourceProductId={product.id}
        onComplete={handlePostUpsellComplete}
      />
    );
  }

  // Confirmed phase
  if (phase === "confirmed") {
    const finalTotal = totalPrice + postUpsellExtra;
    return (
      <Card className="border-border">
        <CardContent className="py-10 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
          <h3 className="text-xl font-semibold">Order confirmed!</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Your order has been placed. We'll contact you at {phone} to confirm delivery.
          </p>
          <div className="bg-secondary rounded-lg p-3 text-sm inline-block">
            Total: <span className="font-bold">{finalTotal.toLocaleString()} DA</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Cash on Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer info */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cod-name" className="text-sm">Full Name</Label>
              <Input id="cod-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cod-phone" className="text-sm">Phone Number</Label>
              <Input id="cod-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0555 123 456" type="tel" autoComplete="tel" />
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Wilaya</Label>
              <Select value={wilayaCode} onValueChange={handleWilayaChange}>
                <SelectTrigger><SelectValue placeholder="Select wilaya" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {WILAYAS.map((w) => (
                    <SelectItem key={w.code} value={w.code}>{w.code} - {w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Commune</Label>
              <Select value={commune} onValueChange={setCommune} disabled={!communes.length}>
                <SelectTrigger><SelectValue placeholder={communes.length ? "Select commune" : "Select wilaya first"} /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {communes.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Delivery type */}
          <div className="space-y-2">
            <Label className="text-sm">Delivery Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType("home")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors text-left text-sm ${
                  deliveryType === "home" ? "border-accent bg-accent/10" : "border-border hover:border-muted-foreground"
                }`}
              >
                <Truck className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Home</p>
                  {selectedWilaya && (
                    <p className="text-xs text-muted-foreground">
                      {freeDelivery ? "Free" : `${selectedWilaya.homeDelivery} DA`}
                    </p>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("stop_desk")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors text-left text-sm ${
                  deliveryType === "stop_desk" ? "border-accent bg-accent/10" : "border-border hover:border-muted-foreground"
                }`}
              >
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Stop Desk</p>
                  {selectedWilaya && (
                    <p className="text-xs text-muted-foreground">
                      {freeDelivery ? "Free" : `${selectedWilaya.stopDesk} DA`}
                    </p>
                  )}
                </div>
              </button>
            </div>
          </div>

          <Separator />

          {/* Discount Code */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" /> Discount Code
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
                      : `${appliedDiscount.discount_value.toLocaleString()} DA`}
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
                  placeholder="Enter code"
                  className="font-mono uppercase flex-1"
                  maxLength={30}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyDiscount}
                  disabled={validatingCode || !discountInput.trim()}
                  className="shrink-0"
                >
                  {validatingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                </Button>
              </div>
            )}
            {discountError && (
              <p className="text-xs text-destructive">{discountError}</p>
            )}
          </div>

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{product.title} × {quantity}</span>
              <span>{productTotal.toLocaleString()} DA</span>
            </div>
            {upsellItem && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  {upsellItem.title}
                  <Badge variant="secondary" className="text-xs ml-1">Upsell</Badge>
                </span>
                <span>{upsellTotal.toLocaleString()} DA</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-accent">
                <span className="flex items-center gap-1">
                  Discount
                  <Badge variant="outline" className="text-xs font-mono border-accent/30 text-accent">
                    {appliedDiscount?.code}
                  </Badge>
                </span>
                <span>-{discountAmount.toLocaleString()} DA</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{freeDelivery ? "Free" : (shippingPrice ? `${shippingPrice.toLocaleString()} DA` : "—")}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{totalPrice.toLocaleString()} DA</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!isValid || submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Confirm Order — {totalPrice.toLocaleString()} DA
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
