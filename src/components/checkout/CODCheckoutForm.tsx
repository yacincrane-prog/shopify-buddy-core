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
import { Loader2, Truck, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PostOrderUpsellPage } from "@/components/checkout/PostOrderUpsellPage";
import type { Product } from "@/types/product";
import { useAbandonedLeadCapture } from "@/hooks/useAbandonedLeadCapture";

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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "stop_desk">("home");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<CheckoutPhase>("form");

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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [postUpsellExtra, setPostUpsellExtra] = useState(0);

  const selectedWilaya = useMemo(() => getWilayaByCode(wilayaCode), [wilayaCode]);
  const communes = selectedWilaya?.communes ?? [];
  const shippingPrice = freeDelivery ? 0 : (wilayaCode ? getShippingPrice(wilayaCode, deliveryType) : 0);

  const effectiveUnitPrice = unitPrice ?? Number(product.price);
  const productTotal = effectiveUnitPrice * quantity;
  const upsellTotal = upsellItem ? upsellItem.discountedPrice * upsellItem.quantity : 0;
  const totalPrice = productTotal + upsellTotal + shippingPrice;

  const handleWilayaChange = (code: string) => {
    setWilayaCode(code);
    setCommune("");
  };

  const isValid = name.trim().length >= 3 && phone.trim().length >= 9 && wilayaCode && commune;

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
      });
      setOrderId(order.id);
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
