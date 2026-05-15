import {getUserDisplayName} from './userDisplayName';

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

function resolveAuthRoot(authData: unknown): Record<string, unknown> | null {
  if (!authData || typeof authData !== 'object' || Array.isArray(authData)) {
    return null;
  }
  return authData as Record<string, unknown>;
}

export type AuthProfileFields = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  displayName: string;
  avatarInitial: string;
};

const EMPTY_FIELD = '—';

function fieldOrDash(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    if (c) {
      return c;
    }
  }
  return EMPTY_FIELD;
}

/** Read-only profile fields from persisted auth payload (login / register / Google). */
export function getAuthProfileFields(authData: unknown): AuthProfileFields {
  const root = resolveAuthRoot(authData);
  const user = root ? nestedUser(root) : null;

  const firstName = fieldOrDash(
    pickString(root?.first_name),
    pickString(root?.firstName),
    pickString(user?.first_name),
    pickString(user?.firstName),
    root?.provider === 'google' && root.userInfo && typeof root.userInfo === 'object'
      ? pickString(
          (root.userInfo as Record<string, unknown>).user &&
            typeof (root.userInfo as Record<string, unknown>).user === 'object'
            ? ((root.userInfo as Record<string, unknown>).user as Record<string, unknown>)
                .givenName
            : (root.userInfo as Record<string, unknown>).givenName,
        )
      : undefined,
  );

  const lastName = fieldOrDash(
    pickString(root?.last_name),
    pickString(root?.lastName),
    pickString(user?.last_name),
    pickString(user?.lastName),
    root?.provider === 'google' && root.userInfo && typeof root.userInfo === 'object'
      ? pickString(
          (root.userInfo as Record<string, unknown>).user &&
            typeof (root.userInfo as Record<string, unknown>).user === 'object'
            ? ((root.userInfo as Record<string, unknown>).user as Record<string, unknown>)
                .familyName
            : (root.userInfo as Record<string, unknown>).familyName,
        )
      : undefined,
  );

  const email = fieldOrDash(
    pickString(root?.email),
    pickString(user?.email),
    root?.provider === 'google' && root.userInfo && typeof root.userInfo === 'object'
      ? pickString(
          (root.userInfo as Record<string, unknown>).user &&
            typeof (root.userInfo as Record<string, unknown>).user === 'object'
            ? ((root.userInfo as Record<string, unknown>).user as Record<string, unknown>).email
            : (root.userInfo as Record<string, unknown>).email,
        )
      : undefined,
  );

  const username = fieldOrDash(
    pickString(root?.username),
    pickString(user?.username),
    pickString(root?._appLoginIdentifier),
  );

  const displayName = getUserDisplayName(authData);
  const avatarInitial =
    firstName !== EMPTY_FIELD
      ? firstName.charAt(0).toUpperCase()
      : displayName !== 'Guest'
        ? displayName.charAt(0).toUpperCase()
        : username !== EMPTY_FIELD
          ? username.charAt(0).toUpperCase()
          : '?';

  return {
    firstName,
    lastName,
    email,
    username,
    displayName: displayName === 'Guest' ? username !== EMPTY_FIELD ? username : 'Guest' : displayName,
    avatarInitial,
  };
}
