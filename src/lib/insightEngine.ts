import { prisma } from "@/lib/prisma"; // Assuming prisma client is in lib/prisma

export interface Insight {
  id: string;
  title: string;
  message: string;
  type: "correlation" | "pattern" | "tip";
  severity: "info" | "warning" | "critical";
}

export async function analyzeHealthPatterns(userId: string): Promise<Insight[]> {
  const logs = await prisma.painLog.findMany({
    where: { userId },
    orderBy: { loggedAt: 'desc' },
    take: 30
  });

  const insights: Insight[] = [];

  if (logs.length < 5) return [];

  // 1. Correlation: Pain vs Hydration (Simplified)
  // In a real app, we'd join with User.hydrationCount per day.
  // Here we simulate the logic for the prototype.
  const avgPain = logs.reduce((acc, log) => acc + log.painLevel, 0) / logs.length;

  if (avgPain > 6) {
    insights.push({
      id: "high-pain-avg",
      title: "Elevated Pain Levels",
      message: "Your average pain over the last 30 days is high. Consider reviewing your triggers with your doctor.",
      type: "pattern",
      severity: "warning"
    });
  }

  // 2. Correlation: Flare-up Frequency
  const flareUps = logs.filter(log => log.painLevel >= 7).length;
  if (flareUps > 10) {
    insights.push({
      id: "freq-flares",
      title: "Frequent Flare-ups",
      message: `You've had ${flareUps} high-pain days recently. This may indicate a need for treatment adjustment.`,
      type: "correlation",
      severity: "critical"
    });
  }

  // 3. Generic tip based on data
  insights.push({
    id: "hydration-tip",
    title: "Hydration Check",
    message: "Remember that consistent water intake often helps reduce muscle stiffness.",
    type: "tip",
    severity: "info"
  });

  return insights;
}
