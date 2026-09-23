export const STORAGE_KEYS = {
  USER: "railbook_user",
  USERS: "railbook_users",
  AUTH: "railbook_auth",
  PASSENGERS: "railbook_passengers",
  BOOKINGS: "railbook_bookings",
  PAYMENT_METHODS: "railbook_payment_methods",
} as const;

// ============================================================
// ADMIN STORAGE
// ============================================================

export const ADMIN_TRAINS_KEY =
  "railbook_admin_trains";

// ============================================================
// LOCAL STORAGE
// ============================================================

export function getStorage<T>(
  key: string,
  fallback: T
): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue =
      localStorage.getItem(key);

    if (!storedValue) {
      return fallback;
    }

    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(
      `Failed to read storage key: ${key}`,
      error
    );

    return fallback;
  }
}

export function setStorage<T>(
  key: string,
  value: T
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.error(
      `Failed to save storage key: ${key}`,
      error
    );
  }
}

export function removeStorage(
  key: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(
      `Failed to remove storage key: ${key}`,
      error
    );
  }
}

// ============================================================
// SESSION STORAGE
// ============================================================

export const BOOKING_SELECTION_KEY =
  "railbook_booking_selection";

export const BOOKING_PASSENGERS_KEY =
  "railbook_booking_passengers";

export function getSessionStorage<T>(
  key: string,
  fallback: T
): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value =
      sessionStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    console.error(
      `Failed to read session storage key: ${key}`,
      error
    );

    return fallback;
  }
}

export function setSessionStorage<T>(
  key: string,
  value: T
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.error(
      `Failed to save session storage key: ${key}`,
      error
    );
  }
}

export function removeSessionStorage(
  key: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(
      `Failed to remove session storage key: ${key}`,
      error
    );
  }
}