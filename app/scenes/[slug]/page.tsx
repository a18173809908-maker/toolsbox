import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { AccessBadge, ToolIcon } from '@/components/ToolBadges';
import { scenes, getScene } from '@/lib/scenes';
import { loadAllComparisons, loadToolById } from '@/lib/db/queries';
import type { Tool } from '@/lib/data';

export const revalidate = 3600;

const BASE = 'https://www.aiboxpro.cn';

const C = {
  bg: '#FFF7ED',
  panel: '#FFFFFF',
  ink: '#1F2937',
  inkSoft: '#4B5563',
  inkMuted: '#9CA3AF',
  rule: '#E8D5B7',
  ruleSoft: '#F3E8D0',
  primaryBg: '#FFEDD5',
  accent: '#C2410C',
  successBg: '#DCFCE7',
  success: '#10B981',
  blueBg: '#EFF6FF',
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return scenes.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scene = getScene(slug);
  if (!scene) return { title: 'Not Found' };
  return {
    title: `${scene.title} | AIBoxPro`,
    description: scene.subtitle,
    alternates: { canonical: `/scenes/${scene.slug}` },
    openGraph: {
      title: scene.title,
      description: scene.subtitle,
      url: `${BASE}/scenes/${scene.slug}`,
      type: 'article',
    },
  };
}

async function loadSceneTools(toolIds: string[]): Promise<Tool[]> {
  if (!process.env.DATABASE_URL) return [];
  const tools = await Promise.all(toolIds.map((id) => loadToolById(id)));
  return tools.filter((t): t is NonNullable<typeof t> => Boolean(t));
}

export default async function SceneDetailPage({ params }: Props) {
  const { slug } = await params;
  const scene = getScene(slug);
  if (!scene) notFound();

  const [tools, allComparisons] = await Promise.all([
    loadSceneTools(scene.toolIds),
    process.env.DATABASE_URL ? loadAllComparisons() : Promise.resolve([]),
  ]);

  const related = allComparisons
    .filter((c) => {
      const ids = [c.toolAId, c.toolBId];
      return scene.toolIds.some((id) => ids.includes(id));
    })
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: scene.title,
    description: scene.subtitle,
    url: `${BASE}/scenes/${scene.slug}`,
    step: scene.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title,
      text: step.desc,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />
        <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
          <Link href="/scenes" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>返回场景指南</Link>

          <section style={{ marginTop: 24, marginBottom: 28 }}>
            <p style={{ margin: '0 0 10px', color: C.accent, fontSize: 13, fontWeight: 900 }}>场景指南</p>
            <h1 style={{ margin: '0 0 14px', color: C.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(30px, 6vw, 52px)', lineHeight: 1.1 }}>
              {scene.title}
            </h1>
            <p style={{ margin: '0 0 18px', maxWidth: 820, color: C.inkSoft, fontSize: 16, lineHeight: 1.75 }}>{scene.subtitle}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {scene.targetUsers.map((u) => (
                <span key={u} style={{ padding: '4px 12px', borderRadius: 999, background: C.successBg, color: '#166534', fontSize: 13, fontWeight: 700 }}>
                  {u}
                </span>
              ))}
            </div>
          </section>

          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 'clamp(20px, 4vw, 28px)', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 20px', color: C.ink, fontSize: 22 }}>操作流程</h2>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 18 }}>
              {scene.steps.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 16 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, background: C.primaryBg, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, flexShrink: 0, marginTop: 2 }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{step.title}</div>
                    <div style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75 }}>{step.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {tools.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 22 }}>推荐工具</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 14 }}>
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 18, background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, color: C.ink, textDecoration: 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ToolIcon name={tool.name} mono={tool.mono} brand={tool.brand} url={tool.url} size={40} />
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800 }}>{tool.name}</div>
                          <div style={{ fontSize: 12, color: C.inkMuted }}>{tool.priceCny ?? tool.pricingDetail ?? tool.pricing}</div>
                        </div>
                      </div>
                      <AccessBadge chinaAccess={tool.chinaAccess ?? 'unknown'} chineseUi={tool.chineseUi} compact />
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: C.inkSoft, lineHeight: 1.65 }}>{tool.zh || tool.en}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 'clamp(20px, 4vw, 28px)', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 18px', color: C.ink, fontSize: 22 }}>常见问题</h2>
            <div style={{ display: 'grid', gap: 18 }}>
              {scene.faqs.map((faq, i) => (
                <div key={i} style={{ borderTop: i > 0 ? `1px solid ${C.ruleSoft}` : 'none', paddingTop: i > 0 ? 18 : 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 8 }}>{faq.q}</div>
                  <div style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75 }}>{faq.a}</div>
                </div>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <section>
              <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 22 }}>相关对比</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 12 }}>
                {related.map((c) => (
                  <Link
                    key={c.id}
                    href={`/compare/${c.id}`}
                    style={{ background: C.primaryBg, border: `1px solid ${C.rule}`, borderRadius: 10, padding: 16, color: C.ink, textDecoration: 'none', fontWeight: 800, fontSize: 15 }}
                  >
                    {c.toolA.name} vs {c.toolB.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
