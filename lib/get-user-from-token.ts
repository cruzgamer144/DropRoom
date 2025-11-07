import { getSupabaseAdminClient } from './supabase-admin';

export async function getUserFromRequest(req: RequestLike) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

type HeaderGetter = (name: string) => string | undefined | null;

interface RequestLike {
  headers: {
    get?: HeaderGetter;
    [key: string]: any;
  };
}

export function getTokenFromRequest(req: RequestLike) {
  const getter: HeaderGetter = req.headers.get
    ? (name) => req.headers.get?.(name) ?? undefined
    : (name) => {
        const value = req.headers[name.toLowerCase()];
        if (Array.isArray(value)) {
          return value[0];
        }
        return value ?? undefined;
      };

  const authorization = getter('authorization') || getter('Authorization');
  if (!authorization) return null;
  const [, token] = authorization.split(' ');
  return token ?? null;
}
