import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const postId = params.id;

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ comments });
}

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

  try {
    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid content" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        userId,
        postId,
      },
    });

    return Response.json(comment, { status: 201 });
  } catch (e) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
