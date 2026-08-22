import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

export const initPostHog = () => {
  if (!POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: "https://us.i.posthog.com",
  });
};

export default posthog;