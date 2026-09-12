import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const postId = params.id;
  const userId = session.user.id;

  // We only support "like" for the social feed interaction
  const kind = "like";

  const existing = await prisma.articleReaction.findUnique({
    where: {
      userId_postId_kind: {
        userId,
        postId,
        kind,
      },
    },
  });

  if (existing) {
    await prisma.articleReaction.delete({
      where: { id: existing.id },
    });
    return Response.json({ liked: false });
  }

  await prisma.articleReaction.create({
    data: {
      userId,
      postId,
      kind,
    },
  });

  return Response.json({ liked: true });
}
