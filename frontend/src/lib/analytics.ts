import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = () => {
  if (!GA_MEASUREMENT_ID) return;

  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  ReactGA.event(eventName, parameters);
};