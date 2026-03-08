import { useState, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WILAYAS, getWilayaByCode, getShippingPrice } from "@/data/algeria";
import { useProducts } from "@/hooks/useProducts";
import { Monitor, Smartphone, Tablet, Truck, Building2, ShoppingBag, RotateCcw } from "lucide-react";

const VIEWPORTS = [
  { id: "desktop" as const, icon: Monitor, width: "480px", label: "Desktop" },
  { id: "tablet" as const, icon: Tablet, width: "420px", label: "Tablet" },
  { id: "mobile" as const, icon: Smartphone, width: "340px", label: "Mobile" },
];

export default function AdminCheckoutPreview() {
  const { data: products } = useProducts();
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Simulated form state
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("Ahmed Benali");
  const [phone, setPhone] = useState("0555 123 456");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "stop_desk">("home");
  const [freeDelivery, setFreeDelivery] = useState(false);

  const selectedProduct = products?.find((p) => p.id === productId);
  const selectedWilaya = useMemo(() => getWilayaByCode(wilayaCode), [wilayaCode]);
  const communes = selectedWilaya?.communes ?? [];
  const shippingPrice = freeDelivery ? 0 : (wilayaCode ? getShippingPrice(wilayaCode, deliveryType) : 0);

  const unitPrice = selectedProduct ? Number(selectedProduct.price) : 2500;
  const productTotal = unitPrice * quantity;
  const totalPrice = productTotal + shippingPrice;

  const handleWilayaChange = (code: string) => {
    setWilayaCode(code);
    setCommune("");
  };

  const resetForm = () => {
    setName("Ahmed Benali");
    setPhone("0555 123 456");
    setWilayaCode("");
    setCommune("");
    setDeliveryType("home");
    setQuantity(1);
  };

  const currentVp = VIEWPORTS.find((v) => v.id === viewport)!;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Checkout Preview"
        description="Test how the order form looks and verify shipping calculations"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls */}
        <Card className="lg:w-80 shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Test Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Test Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a product…" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title} — {Number(p.price).toLocaleString()} DA</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" min={1} max={99} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="h-9" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="free-del" checked={freeDelivery} onChange={(e) => setFreeDelivery(e.target.checked)} className="rounded" />
              <Label htmlFor="free-del" className="text-xs cursor-pointer">Free delivery</Label>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Viewport</Label>
              <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/30">
                {VIEWPORTS.map((vp) => (
                  <Button
                    key={vp.id}
                    variant={viewport === vp.id ? "default" : "ghost"}
                    size="icon"
                    className="h-7 w-7 flex-1"
                    onClick={() => setViewport(vp.id)}
                    title={vp.label}
                  >
                    <vp.icon className="w-3.5 h-3.5" />
                  </Button>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={resetForm}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Form
            </Button>

            {/* Shipping reference */}
            {wilayaCode && selectedWilaya && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Shipping Info</Label>
                  <div className="text-xs space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border">
                    <p><span className="text-muted-foreground">Wilaya:</span> <span className="font-medium">{selectedWilaya.name}</span></p>
                    <p><span className="text-muted-foreground">Home:</span> <span className="font-medium">{selectedWilaya.homeDelivery} DA</span></p>
                    <p><span className="text-muted-foreground">Stop Desk:</span> <span className="font-medium">{selectedWilaya.stopDesk} DA</span></p>
                    <p><span className="text-muted-foreground">Current:</span> <span className="font-bold text-accent">{freeDelivery ? "Free" : `${shippingPrice} DA`}</span></p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right: Form preview */}
        <div className="flex-1 flex justify-center">
          <div
            className="transition-all duration-300"
            style={{ width: currentVp.width, maxWidth: "100%" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px]">
                Preview — {currentVp.label} ({currentVp.width})
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Not a real order
              </Badge>
            </div>

            <Card className="border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Cash on Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {/* Customer info */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="prev-name" className="text-sm">Full Name</Label>
                      <Input id="prev-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="prev-phone" className="text-sm">Phone Number</Label>
                      <Input id="prev-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0555 123 456" type="tel" />
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
                      <span className="text-muted-foreground">{selectedProduct?.title ?? "Product"} × {quantity}</span>
                      <span>{productTotal.toLocaleString()} DA</span>
                    </div>
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

                  <Button size="lg" className="w-full pointer-events-none opacity-80">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Confirm Order — {totalPrice.toLocaleString()} DA
                  </Button>

                  <p className="text-[10px] text-center text-muted-foreground/60 uppercase tracking-wider">
                    Preview mode — no order will be placed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
