export function startOfCurrentMonth(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function currentMonthKey(): string {
  return startOfCurrentMonth().slice(0, 10);
}

export function isBeforeCurrentMonth(dateIso: string | null | undefined) {
  if (!dateIso) return true;
  const reference = new Date(dateIso);
  const startCurrent = new Date(startOfCurrentMonth());
  return reference < startCurrent;
}
