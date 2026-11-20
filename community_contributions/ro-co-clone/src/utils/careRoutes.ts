import type { CareArea } from "../data/types";

const goalByArea: Record<CareArea, string> = {
  weight: "Weight",
  "sexual-health": "Sexual health",
  hair: "Hair",
  skin: "Skin",
};

const areaByGoal: Record<string, CareArea> = {
  weight: "weight",
  "weight-loss": "weight",
  "sexual-health": "sexual-health",
  sex: "sexual-health",
  hair: "hair",
  skin: "skin",
};

export function visitPath(area: CareArea, productId?: string): string {
  const params = new URLSearchParams({ goal: area });
  if (productId) params.set("product", productId);
  return `/visit?${params.toString()}`;
}

export function goalLabelForArea(area: CareArea): string {
  return goalByArea[area];
}

export function careAreaFromParam(raw: string | null): CareArea | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return areaByGoal[key] ?? null;
}
