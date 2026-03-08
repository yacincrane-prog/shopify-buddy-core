import { useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchActivePixels, type TrackingPixel } from "@/lib/tracking-pixels";

// Ensure each pixel script is injected only once
const injectedPixels = new Set<string>();

function injectFacebookPixel(pixelId: string) {
  const key = `fb_${pixelId}`;
  if (injectedPixels.has(key)) return;
  injectedPixels.add(key);

  const script = document.createElement("script");
  script.async = true;
  script.innerHTML = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init','${pixelId}');
  `;
  document.head.appendChild(script);
}

function injectTikTokPixel(pixelId: string) {
  const key = `tt_${pixelId}`;
  if (injectedPixels.has(key)) return;
  injectedPixels.add(key);

  const script = document.createElement("script");
  script.async = true;
  script.innerHTML = `
    !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
    ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
    ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
    ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
    ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
    ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e+""]=+new Date;
    ttq._o=ttq._o||{};ttq._o[e+""]=n||{};
    var a=d.createElement("script");a.type="text/javascript";a.async=!0;a.src=r+"?sdkid="+e+"&lib="+t;
    var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)};
    ttq.load('${pixelId}');
    }(window,document,'ttq');
  `;
  document.head.appendChild(script);
}

function fireFacebookEvent(event: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", event, params);
  }
}

function fireTikTokEvent(event: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).ttq) {
    (window as any).ttq.track(event, params);
  }
}

const FB_EVENT_MAP: Record<string, string> = {
  PageView: "PageView",
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "Purchase",
};

const TT_EVENT_MAP: Record<string, string> = {
  PageView: "Pageview",
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
};

export function useTrackingPixels() {
  const { data: pixels } = useQuery({
    queryKey: ["active-tracking-pixels"],
    queryFn: fetchActivePixels,
    staleTime: 5 * 60 * 1000,
  });

  const pixelsRef = useRef<TrackingPixel[]>([]);
  pixelsRef.current = pixels ?? [];

  // Inject scripts once loaded
  useEffect(() => {
    if (!pixels?.length) return;
    pixels.forEach((p) => {
      if (p.platform === "facebook") injectFacebookPixel(p.pixel_id);
      else if (p.platform === "tiktok") injectTikTokPixel(p.pixel_id);
    });
  }, [pixels]);

  const trackEvent = useCallback(
    (event: string, params?: Record<string, any>) => {
      const activePixels = pixelsRef.current;
      if (!activePixels.length) return;

      const hasFb = activePixels.some((p) => p.platform === "facebook");
      const hasTt = activePixels.some((p) => p.platform === "tiktok");

      if (hasFb && FB_EVENT_MAP[event]) {
        fireFacebookEvent(FB_EVENT_MAP[event], params);
      }
      if (hasTt && TT_EVENT_MAP[event]) {
        fireTikTokEvent(TT_EVENT_MAP[event], params);
      }
    },
    []
  );

  return { trackEvent, pixels: pixelsRef.current };
}
