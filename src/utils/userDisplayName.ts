function pickString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const t = value.trim();
    return t.length > 0 ? t : undefined;
  }
  return undefined;
}

function nestedUser(root: Record<string, unknown>): Record<string, unknown> | null {
  const u = root.user;
  if (u && typeof u === 'object' && !Array.isArray(u)) {
    return u as Record<string, unknown>;
  }
  return null;
}

/**
 * Resolves a short label for the signed-in user. Prefers API `username`, then the
 * identifier used at login (`_appLoginIdentifier`), then email / name fields.
 * Google sign-in stores `userInfo` from `@react-native-google-signin/google-signin`.
 */
export function getUserDisplayName(authData: unknown): string {
  if (!authData || typeof authData !== 'object' || Array.isArray(authData)) {
    return 'Guest';
  }

  const o = authData as Record<string, unknown>;

  if (o.provider === 'google' && o.userInfo && typeof o.userInfo === 'object') {
    const info = o.userInfo as Record<string, unknown>;
    const user =
      info.user && typeof info.user === 'object' && !Array.isArray(info.user)
        ? (info.user as Record<string, unknown>)
        : info;

    return (
      pickString(user.name) ||
      pickString(user.givenName) ||
      pickString(user.email) ||
      'Guest'
    );
  }

  const user = nestedUser(o);

  return (
    pickString(o.username) ||
    pickString(user?.username) ||
    pickString(o._appLoginIdentifier) ||
    pickString(user?.email) ||
    pickString(o.email) ||
    pickString(o.first_name) ||
    pickString(o.firstName) ||
    pickString(user?.first_name) ||
    pickString(user?.firstName) ||
    'Guest'
  );
}
