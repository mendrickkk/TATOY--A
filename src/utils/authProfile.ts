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

export const EMPTY_PROFILE_FIELD = '—';

const EMPTY_FIELD = EMPTY_PROFILE_FIELD;

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

export function isGoogleAuthProvider(authData: unknown): boolean {
  const root = resolveAuthRoot(authData);
  return root?.provider === 'google';
}

/** Map displayed profile fields to form state (empty instead of em dash). */
export function profileFieldsToFormValues(fields: AuthProfileFields): ProfileFormValues {
  const toForm = (v: string) => (v === EMPTY_FIELD ? '' : v);
  return {
    firstName: toForm(fields.firstName),
    lastName: toForm(fields.lastName),
    email: toForm(fields.email),
    username: toForm(fields.username),
  };
}

/** Merge edited profile into persisted auth payload (login / Google / nested user). */
export function mergeProfileIntoAuthData(
  authData: unknown,
  values: ProfileFormValues,
): unknown {
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim();
  const username = values.username.trim();

  if (!authData || typeof authData !== 'object' || Array.isArray(authData)) {
    return {
      firstName,
      first_name: firstName,
      lastName,
      last_name: lastName,
      email,
      username,
    };
  }

  const root = {...(authData as Record<string, unknown>)};
  root.firstName = firstName;
  root.first_name = firstName;
  root.lastName = lastName;
  root.last_name = lastName;
  root.email = email;
  root.username = username;

  const user = nestedUser(root);
  if (user) {
    root.user = {
      ...user,
      firstName,
      first_name: firstName,
      lastName,
      last_name: lastName,
      email,
      username,
    };
  }

  return root;
}

const AUTH_TOKEN_KEYS = [
  'token',
  'access_token',
  'accessToken',
  'jwt',
  'JWT',
  'provider',
  'userInfo',
  '_appLoginIdentifier',
  '_appLoginRaw',
] as const;

/** Keep login tokens and provider metadata when merging profile API responses. */
export function preserveAuthSessionFields(previous: unknown, next: unknown): unknown {
  if (!previous || typeof previous !== 'object' || Array.isArray(previous)) {
    return next;
  }
  if (!next || typeof next !== 'object' || Array.isArray(next)) {
    return next;
  }
  const prev = previous as Record<string, unknown>;
  const merged = {...(next as Record<string, unknown>)};
  for (const key of AUTH_TOKEN_KEYS) {
    if (prev[key] !== undefined && merged[key] === undefined) {
      merged[key] = prev[key];
    }
  }
  return merged;
}

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
