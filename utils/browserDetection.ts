export const getiOSVersion = () => {
  if (typeof window === "undefined") return null;
  const userAgent = window.navigator.userAgent;
  const match = userAgent.match(/OS (\d+)_/);
  return match ? parseInt(match[1], 10) : null;
};

export const isSafari = () => {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  // Safari check: includes 'safari' but not 'chrome' or 'crios'
  // Note: Safari on iOS includes 'safari' and 'mobile'
  return (
    ua.includes("safari") &&
    !ua.includes("chrome") &&
    !ua.includes("crios") &&
    (ua.includes("version/") || ua.includes("mobile"))
  );
};
