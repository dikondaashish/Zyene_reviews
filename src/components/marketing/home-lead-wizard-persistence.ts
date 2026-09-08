const SEEN_KEY = "zyene-home-book-wizard-seen";

export function hasSeenHomeLeadWizard() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markHomeLeadWizardSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // The wizard still works when storage is unavailable.
  }
}
