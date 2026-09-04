import { getServerSession } from "next-auth";
import { generateObject } from "ai";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  getModel,
  getProviderDisplayName,
  isAiConfigured,
  isMockMode,
} from "@/lib/ai/provider";
import { checkFeatureRateLimit } from "@/lib/ai/ratelimit";
import { detectWeatherTriggers, type WeatherData, type WeatherTriggerId } from "@/lib/weather";
import { buildResourceFeed, RESOURCE_CATALOG, type ResourceFeedCategory } from "@/lib/resources/feed";

export const maxDuration = 30;

const categorySchema = z.enum([
  "all",
  "managingFlares",
  "nutritionHydration",
  "gentleMovement",
  "mentalSupport",
]);

const requestSchema = z.object({
  painLevel: z.number().min(0).max(10),
  energyRemaining: z.number().min(0).max(12),
  category: categorySchema,
  refreshSeed: z.number().int().min(0).max(100_000),
  weather: z.object({
    temperature: z.number(),
    humidity: z.number().min(0).max(100),
    pressure: z.number(),
    condition: z.enum(["sunny", "cloudy", "rainy"]),
  }),
  locale: z.enum(["en", "ar"]).default("en"),
});

const aiSelectionSchema = z.object({
  resourceIds: z.array(z.string()).min(1).max(3),
});

type FeedRequest = z.infer<typeof requestSchema>;

function safeTriggers(weather: WeatherData): WeatherTriggerId[] {
  return detectWeatherTriggers(weather);
}

function fallbackFeed(input: FeedRequest) {
  return buildResourceFeed({
    painLevel: input.painLevel,
    energyRemaining: input.energyRemaining,
    weatherTriggers: safeTriggers(input.weather),
    category: input.category,
    refreshSeed: input.refreshSeed,
  });
}

function isApprovedSelection(ids: string[], category: ResourceFeedCategory): boolean {
  const approved = new Map(RESOURCE_CATALOG.map((item) => [item.resourceId, item]));
  if (new Set(ids).size !== ids.length) return false;
  return ids.every((id) => {
    const resource = approved.get(id);
    return Boolean(resource && (category === "all" || resource.category === category));
  });
}

function promptFor(input: FeedRequest, candidateIds: string[]): string {
  return [
    "Select up to three resource IDs for a personalized fibromyalgia self-care feed.",
    "Return only JSON matching the schema: { resourceIds: string[] }.",
    "Choose only IDs from the provided candidates. Never create IDs, medical advice, diagnoses, or medication instructions.",
    `Pain: ${input.painLevel}/10. Energy remaining: ${input.energyRemaining}/12.`,
    `Weather: ${input.weather.temperature}C, ${input.weather.humidity}% humidity, ${input.weather.pressure} hPa, ${input.weather.condition}.`,
    `Category: ${input.category}. Locale: ${input.locale}.`,
    `Candidates: ${candidateIds.join(", ")}`,
  ].join("\n");
}

/**
 * Personalized Care Resources feed. The model only selects curated IDs;
 * content and explanations remain local, validated, and citation-safe.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Please sign in first." }, { status: 401 });
  }

  const limit = await checkFeatureRateLimit(session.user.id);
  if (!limit.ok) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
    return Response.json(
      { error: "Give the AI a moment — try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let input: FeedRequest;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid resource feed request." }, { status: 400 });
  }

  const fallback = fallbackFeed(input);
  if (isMockMode() || !isAiConfigured()) {
    return Response.json({ feed: fallback, source: "fallback" });
  }

  const model = getModel();
  if (!model) return Response.json({ feed: fallback, source: "fallback" });

  const candidates = buildResourceFeed({
    ...input,
    weatherTriggers: safeTriggers(input.weather),
  }).map((item) => item.resourceId);

  try {
    const { object, usage } = await generateObject({
      model,
      schema: aiSelectionSchema,
      system: promptFor(input, candidates),
      prompt: "Refresh the Care Resources feed for this check-in.",
      temperature: 0.2,
      maxOutputTokens: 256,
    });
    const parsed = aiSelectionSchema.parse(object);
    if (!isApprovedSelection(parsed.resourceIds, input.category)) {
      return Response.json({ feed: fallback, source: "fallback" });
    }

    const byId = new Map(fallback.map((item) => [item.resourceId, item]));
    const feed = parsed.resourceIds.flatMap((id) => {
      const item = byId.get(id);
      return item ? [item] : [];
    });
    if (feed.length === 0) return Response.json({ feed: fallback, source: "fallback" });

    console.log(
      `[ai] resources · provider=${getProviderDisplayName()} · in=${usage.inputTokens} out=${usage.outputTokens}`
    );
    return Response.json({ feed, source: "ai" });
  } catch (error) {
    console.warn("[ai] resources selection failed — using deterministic feed:", error);
    return Response.json({ feed: fallback, source: "fallback" });
  }
}
