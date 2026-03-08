import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { orderIds, testMode } = body;

    // Get config
    const { data: configs } = await supabase
      .from("google_sheets_config")
      .select("*")
      .limit(1);

    const config = configs?.[0];
    if (!config?.webhook_url || !config?.is_active) {
      return new Response(
        JSON.stringify({ error: "Google Sheets not configured or inactive" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Test mode: send sample data
    if (testMode) {
      const sampleRow = {
        date: new Date().toISOString(),
        product_name: "Test Product",
        quantity: 1,
        customer_name: "Test Customer",
        phone: "0500000000",
        wilaya: "Algiers",
        commune: "Bab El Oued",
        delivery_type: "home",
        shipping_price: 500,
        total_price: 3500,
        status: "test",
        order_id: "test-" + Date.now(),
      };

      const res = await fetch(config.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: [sampleRow] }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Webhook failed [${res.status}]: ${text}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Test row sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get column mapping
    const columnMapping = (config.column_mapping as string[]) || [
      "date", "product_name", "quantity", "customer_name", "phone",
      "wilaya", "commune", "delivery_type", "shipping_price", "total_price", "status",
    ];

    // Fetch orders
    let query = supabase.from("orders").select("*");
    if (orderIds?.length) {
      query = query.in("id", orderIds);
    } else {
      query = query.eq("exported_to_sheets", false);
    }
    const { data: orders, error: ordersErr } = await query.order("created_at", { ascending: true });
    if (ordersErr) throw ordersErr;
    if (!orders?.length) {
      return new Response(
        JSON.stringify({ success: true, exported: 0, message: "No new orders to export" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fieldMap: Record<string, (o: any) => any> = {
      date: (o) => o.created_at,
      product_name: (o) => o.product_title,
      quantity: (o) => o.quantity,
      customer_name: (o) => o.customer_name,
      phone: (o) => o.customer_phone,
      wilaya: (o) => o.wilaya,
      commune: (o) => o.commune,
      delivery_type: (o) => o.delivery_type,
      shipping_price: (o) => o.shipping_price,
      total_price: (o) => o.total_price,
      status: (o) => o.status,
    };

    const rows = orders.map((order) => {
      const row: Record<string, any> = { order_id: order.id };
      for (const col of columnMapping) {
        row[col] = fieldMap[col] ? fieldMap[col](order) : "";
      }
      return row;
    });

    // Send to webhook
    const res = await fetch(config.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Webhook failed [${res.status}]: ${text}`);
    }

    // Mark as exported
    const ids = orders.map((o) => o.id);
    await supabase.from("orders").update({ exported_to_sheets: true }).in("id", ids);

    // Update config stats
    const newTotal = (config.total_exported || 0) + orders.length;
    await supabase
      .from("google_sheets_config")
      .update({ total_exported: newTotal, last_export_at: new Date().toISOString() })
      .eq("id", config.id);

    return new Response(
      JSON.stringify({ success: true, exported: orders.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Export error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
