import { readImage } from '@/lib/storage';

const TYPES: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };

export async function GET(_req: Request, ctx: RouteContext<'/uploads/[...path]'>) {
  const { path } = await ctx.params;
  const file = await readImage(path);
  if (!file) return new Response('Not found', { status: 404 });
  const ext = path.at(-1)?.split('.').pop()?.toLowerCase() ?? '';
  return new Response(new Uint8Array(file), {
    headers: {
      'Content-Type': TYPES[ext] ?? 'application/octet-stream',
      // imena fajlova su jedinstvena (UUID), sadržaj se nikad ne menja
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
