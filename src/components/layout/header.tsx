import { getSubcategories, getSubcategoryCounts } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { HeaderClient, type MenuSub } from './header-client';

export async function Header() {
  const [subs, all, zene, muskarci, user] = await Promise.all([
    getSubcategories(),
    getSubcategoryCounts(),
    getSubcategoryCounts('zene'),
    getSubcategoryCounts('muskarci'),
    getCurrentUser(),
  ]);
  const menu: MenuSub[] = subs.map((s) => ({
    slug: s.slug,
    name: s.name,
    category: s.category,
    counts: { all: all.get(s.id) ?? 0, zene: zene.get(s.id) ?? 0, muskarci: muskarci.get(s.id) ?? 0 },
  }));

  return (
    <HeaderClient
      subcategories={menu}
      user={user ? { name: user.name, isAdmin: user.role === 'admin' } : null}
    />
  );
}
