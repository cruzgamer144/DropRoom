import { handleAuthCallback } from "@/lib/actions";

interface CallbackPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function AuthCallbackPage({ searchParams }: CallbackPageProps) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (typeof value === "string") {
      params.append(key, value);
    }
  });

  await handleAuthCallback(params);
  return null;
}
