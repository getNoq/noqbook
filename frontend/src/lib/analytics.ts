// One place that knows how to talk to analytics providers. Call sites
// elsewhere in the app only ever use trackPageView/trackEvent/
// identifyUser — never gtag/posthog directly — so adding a provider
// later means editing this file only, nothing that calls it.

type EventProps = Record<string, string | number | boolean | undefined>;

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let gaInitialized = false;

function loadGoogleAnalytics(measurementId: string) {
  if (gaInitialized) return;
  gaInitialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  // send_page_view: false — GA4's built-in SPA pageview detection can
  // miss or double-fire on React Router's client-side navigation.
  // trackPageView() below fires page_view explicitly instead, tied
  // to actual route changes, which is more reliable.
  gtag("config", measurementId, { send_page_view: false });
}

export function initAnalytics() {
  if (GA_MEASUREMENT_ID) loadGoogleAnalytics(GA_MEASUREMENT_ID);
  // A future provider's init call goes here, gated the same way —
  // its own env var, its own guard, its own loader function.
}

export function trackPageView(path: string, title?: string) {
  if (GA_MEASUREMENT_ID && (window as any).gtag) {
    (window as any).gtag("event", "page_view", {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
  // Future: posthog.capture('$pageview', { path })
}

export function trackEvent(name: string, props: EventProps = {}) {
  if (GA_MEASUREMENT_ID && (window as any).gtag) {
    (window as any).gtag("event", name, props);
  }
  // Future: posthog.capture(name, props)
}

// export function identifyUser(userId: string, traits: EventProps = {}) {
export function identifyUser(userId: string) {
  if (GA_MEASUREMENT_ID && (window as any).gtag) {
    (window as any).gtag("set", { user_id: userId });
  }
  // Future: posthog.identify(userId, traits)
}