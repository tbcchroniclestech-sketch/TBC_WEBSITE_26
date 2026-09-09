export const GA4_MEASUREMENT_ID = "G-N5HXCY4S32";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

let previousPagePath = "";
let isTrackingInitialized = false;

function currentPagePath() {
  return `${window.location.pathname}${window.location.search}`;
}

export function trackPageView() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const pagePath = currentPagePath();
  if (pagePath === previousPagePath) return;

  previousPagePath = pagePath;
  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: pagePath,
  });
}

export function initializeGA4RouteTracking() {
  if (typeof window === "undefined" || isTrackingInitialized) {
    trackPageView();
    return () => undefined;
  }

  isTrackingInitialized = true;
  trackPageView();

  const dispatchRouteChange = () => window.dispatchEvent(new Event("tbc:route-change"));
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function pushState(...args) {
    originalPushState.apply(this, args);
    dispatchRouteChange();
  };

  window.history.replaceState = function replaceState(...args) {
    originalReplaceState.apply(this, args);
    dispatchRouteChange();
  };

  window.addEventListener("popstate", dispatchRouteChange);
  window.addEventListener("tbc:route-change", trackPageView);

  return () => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", dispatchRouteChange);
    window.removeEventListener("tbc:route-change", trackPageView);
    isTrackingInitialized = false;
  };
}
