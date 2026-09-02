import type { WeatherTriggerId } from "@/lib/weather";
import { BODY_PARTS, type BodyPartId, type ResourceCategoryId } from "./engine";

export type ResourceFeedCategory = ResourceCategoryId | "all";

export interface ResourceCatalogItem {
  resourceId: string;
  category: ResourceCategoryId;
  effort: "low" | "medium";
}

/** The only resource IDs an AI response is allowed to select. */
export const RESOURCE_CATALOG: readonly ResourceCatalogItem[] = [
  { resourceId: "flare-pacing", category: "managingFlares", effort: "low" },
  { resourceId: "flare-heat", category: "managingFlares", effort: "low" },
  { resourceId: "flare-breathwork", category: "mentalSupport", effort: "low" },
  { resourceId: "mental-audio", category: "mentalSupport", effort: "low" },
  { resourceId: "nutri-antiinflam", category: "nutritionHydration", effort: "medium" },
  { resourceId: "nutri-hydration", category: "nutritionHydration", effort: "medium" },
  { resourceId: "move-stretching", category: "gentleMovement", effort: "medium" },
  { resourceId: "move-walking", category: "gentleMovement", effort: "medium" },
  { resourceId: "mental-mindfulness", category: "mentalSupport", effort: "low" },
  { resourceId: "mental-sleep", category: "mentalSupport", effort: "medium" },
];

const CATALOG_BY_ID = new Map(
  RESOURCE_CATALOG.map((resource) => [resource.resourceId, resource])
);

export interface ResourceFeedInput {
  painLevel: number;
  energyRemaining: number;
  weatherTriggers: WeatherTriggerId[];
  category: ResourceFeedCategory;
  refreshSeed: number;
}

export interface ResourceFeedItem extends ResourceCatalogItem {
  /** Safe, deterministic explanation of why this item is surfaced. */
  reason: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function rotate<T>(items: readonly T[], offset: number): T[] {
  if (items.length === 0) return [];
  const normalized = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

function weatherMatches(resourceId: string, triggers: WeatherTriggerId[]): boolean {
  if (triggers.includes("humidity-high") && resourceId === "nutri-hydration") return true;
  if (
    (triggers.includes("pressure-drop") ||
      triggers.includes("pressure-low") ||
      triggers.includes("heat-extreme") ||
      triggers.includes("cold-extreme")) &&
    resourceId === "flare-heat"
  ) {
    return true;
  }
  return false;
}

function reasonFor(
  resource: ResourceCatalogItem,
  input: ResourceFeedInput,
  weatherMatch: boolean
): string {
  if (input.painLevel >= 7 || input.energyRemaining <= 2) {
    return `A low-effort option for a ${input.painLevel}/10 pain day with ${input.energyRemaining} energy left.`;
  }
  if (weatherMatch) return "A gentle option matched to today's weather signals.";
  if (resource.category === "mentalSupport") {
    return "A calm support option for easing stress and making space to recover.";
  }
  if (resource.category === "gentleMovement") {
    return "A gradual movement option; stop if symptoms sharpen or linger.";
  }
  return "A practical care option matched to your current check-in.";
}

/**
 * Returns the category/body selection without ever producing an empty result
 * just because the body map and category have no intersection.
 */
export function filterResourceCatalog(
  category: ResourceFeedCategory,
  selectedBodyPart?: BodyPartId | null
): ResourceCatalogItem[] {
  const categoryItems = RESOURCE_CATALOG.filter(
    (resource) => category === "all" || resource.category === category
  );
  if (!selectedBodyPart) return categoryItems;

  const bodyIds = new Set(BODY_PARTS[selectedBodyPart].cardIds);
  const intersection = categoryItems.filter((resource) => bodyIds.has(resource.resourceId));
  return intersection.length > 0 ? intersection : categoryItems;
}

/** Build a deterministic, weather/pain/energy-aware feed from approved cards. */
export function buildResourceFeed(input: ResourceFeedInput): ResourceFeedItem[] {
  const pain = clamp(input.painLevel, 0, 10);
  const energy = clamp(input.energyRemaining, 0, 12);
  const candidates = filterResourceCatalog(input.category);
  const candidateIds = new Set(candidates.map((resource) => resource.resourceId));
  const weatherPriority = input.weatherTriggers
    .flatMap((trigger) => {
      if (trigger === "humidity-high") return ["nutri-hydration"];
      if (trigger === "pressure-drop" || trigger === "pressure-low") return ["flare-heat"];
      if (trigger === "heat-extreme" || trigger === "cold-extreme") return ["flare-heat"];
      return [];
    })
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .filter((id) => candidateIds.has(id));

  const lowEffort = candidates
    .filter((resource) => resource.effort === "low")
    .map((resource) => resource.resourceId);
  const regular = candidates
    .filter((resource) => resource.effort === "medium")
    .map((resource) => resource.resourceId);
  const baseOrder =
    pain >= 7 || energy <= 2
      ? ["flare-breathwork", "mental-audio", "mental-mindfulness", ...lowEffort, ...regular]
      : [...weatherPriority, ...regular, ...lowEffort];
  const uniqueIds = [...new Set(baseOrder)].filter((id) => candidateIds.has(id));
  const remaining = candidates
    .map((resource) => resource.resourceId)
    .filter((id) => !uniqueIds.includes(id));
  const orderedIds = [
    ...rotate(uniqueIds, input.refreshSeed),
    ...rotate(remaining, input.refreshSeed),
  ];

  return orderedIds.slice(0, 3).flatMap((resourceId) => {
    const resource = CATALOG_BY_ID.get(resourceId);
    if (!resource) return [];
    const weatherMatch = weatherMatches(resourceId, input.weatherTriggers);
    return [{
      ...resource,
      reason: reasonFor(resource, { ...input, painLevel: pain, energyRemaining: energy }, weatherMatch),
    }];
  });
}
