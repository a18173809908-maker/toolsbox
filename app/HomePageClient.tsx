'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { ToolIcon } from '@/components/ToolBadges';
import { v2Tokens as T } from '@/lib/tokens';
import type { Tool, Category, RepoItem, TrendingPeriod } from '@/lib/data';
import { LANG_COLOR } from '@/lib/data';

type Article = {
  id: number;
  title: string;
  summary: string | null;
  sourceName: string | null;
  publishedAt: Date | null;
  category: string | null;
};

type HomeEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: Date | null;
};

type HomePageClientProps = {
  tools: Tool[];
  categories: Category[];
  trending: Record<TrendingPeriod, RepoItem[]>;
  articles: Article[];
  events: HomeEvent[];
};

const sceneSolutions = [
  { title: '做小红书内容', icon: '📝', desc: '文案+图片+视频一站式', cat: 'social' },
  { title: '写代码', icon: '💻', desc: 'AI编程助手推荐', cat: 'code' },
  { title: '做PPT', icon: '📊', desc: 'AI生成演示文稿', cat: 'ppt' },
  { title: '做视频', icon: '🎬', desc: 'AI视频生成工具', cat: 'video' },
  { title: '做设计', icon: '🎨', desc: 'AI绘图+设计工具', cat: 'design' },
  { title: '写文案', icon: '✍️', desc: 'AI写作工具合集', cat: 'writing' },
];

const quickTags: { label: string; href: string }[] = [
  { label: '免费工具',   href: '/tools?pricing=Free' },
  { label: '国内可用',   href: '/tools?china=accessible' },
  { label: 'AI写作',    href: '/tools?cat=writing' },
  { label: 'AI绘图',    href: '/tools?cat=image' },
  { label: '编程助手',   href: '/tools?cat=code' },
  { label: '视频创作',   href: '/tools?cat=video' },
  { label: '办公效率',   href: '/tools?cat=productivity' },
];

// 清洗 RSS 来源摘要里的 HTML 标签和实体（如 InfoQ feed 末尾的 "点击查看原文" <div> 标签）。
// 这是渲染层护栏；底层数据由起草过滤器收紧（A 路径）+ 后续 cleanup 脚本清洗。
function stripHtmlForDisplay(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function formatTimeAgo(date: Date | null): string {
  if (!date) return '';
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return `${Math.floor(days / 7)}周前`;
}

function pricingLabel(pricing: string): string {
  switch (pricing) {
    case 'Free': return '免费';
    case 'Freemium': return '免费增值';
    case 'Paid': return '付费';
    default: return pricing;
  }
}

export function HomePageClient({ tools, categories, trending, articles, events }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const featuredTools = tools.filter((t) => t.featured).slice(0, 9);
  const weekTrending = trending.week?.slice(0, 3) || [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        backgroundImage: `
          linear-gradient(rgba(222, 214, 199, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(222, 214, 199, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }}
    >
      <SiteHeader />

      <section
        style={{
          background: 'transparent',
          padding: '60px 20px 80px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: T.ink,
              marginBottom: 12,
              lineHeight: 1.3,
            }}
          >
            面向中文用户的 AI 工具选择与使用指南平台
          </h1>
          <p
            style={{
              fontSize: 16,
              color: T.inkMuted,
              marginBottom: 40,
            }}
          >
            帮你找到真正好用的 AI 工具，并教会你如何使用
          </p>

          <div
            style={{
              position: 'relative',
              maxWidth: 600,
              margin: '0 auto 24px',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 AI 工具，如：免费写作工具、国内可用..."
              style={{
                width: '100%',
                padding: '16px 24px 16px 52px',
                fontSize: 16,
                border: `2px solid ${T.rule}`,
                borderRadius: 16,
                background: '#fff',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = T.accent;
                e.target.style.boxShadow = `0 0 0 4px ${T.primaryBg}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = T.rule;
                e.target.style.boxShadow = 'none';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = searchQuery.trim();
                  window.location.href = query ? `/tools?q=${encodeURIComponent(query)}` : '/tools';
                }
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 20,
              }}
            >
              🔍
            </span>
            <button
              onClick={() => {
                const query = searchQuery.trim();
                window.location.href = query ? `/tools?q=${encodeURIComponent(query)}` : '/tools';
              }}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '10px 24px',
                background: T.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              搜索
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 14, color: T.inkMuted }}>热门搜索：</span>
            {quickTags.map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                style={{
                  padding: '6px 14px',
                  background: '#fff',
                  border: `1px solid ${T.rule}`,
                  borderRadius: 20,
                  fontSize: 13,
                  color: T.inkSoft,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.accent;
                  e.currentTarget.style.color = T.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.rule;
                  e.currentTarget.style.color = T.inkSoft;
                }}
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <section style={{ marginBottom: 60 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🔥</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: T.ink, margin: 0 }}>
                编辑推荐
              </h2>
              <span
                style={{
                  padding: '4px 10px',
                  background: T.primaryBg,
                  color: T.accent,
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                精选 {featuredTools.length} 个
              </span>
            </div>
            <Link
              href="/tools"
              style={{
                fontSize: 14,
                color: T.accent,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              查看全部 →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 20,
            }}
          >
            {featuredTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  border: `1px solid ${T.rule}`,
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    background: `linear-gradient(135deg, ${T.accent}, #EA580C)`,
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  <span>🥇</span>
                  <span>编辑推荐</span>
                </div>

                <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                  <ToolIcon
                    name={tool.name}
                    mono={tool.mono}
                    brand={tool.brand}
                    url={tool.url}
                    size={56}
                  />
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: T.ink,
                        margin: '0 0 4px',
                      }}
                    >
                      {tool.name}
                    </h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          background: T.primaryBg,
                          color: T.accent,
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {pricingLabel(tool.pricing)}
                      </span>
                      {tool.chinaAccess === 'accessible' && (
                        <span
                          style={{
                            padding: '2px 8px',
                            background: '#ECFDF5',
                            color: '#059669',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          🇨🇳 国内直连
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 14,
                    color: T.inkSoft,
                    lineHeight: 1.6,
                    marginBottom: 12,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {tool.zh}
                </p>

                {tool.features && tool.features.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {tool.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        style={{
                          padding: '4px 10px',
                          background: T.bg,
                          color: T.inkMuted,
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 60 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🎯</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: T.ink, margin: 0 }}>
                场景解决方案
              </h2>
            </div>
            <p style={{ fontSize: 14, color: T.inkMuted, margin: '8px 0 0 36px' }}>
              按任务找工具，而不是按分类找工具
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {sceneSolutions.map((scene) => (
              <Link
                key={scene.title}
                href={`/tools?cat=${scene.cat}`}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 24,
                  border: `1px solid ${T.rule}`,
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = T.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = T.rule;
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{scene.icon}</div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: T.ink,
                    margin: '0 0 8px',
                  }}
                >
                  {scene.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: T.inkMuted,
                    margin: 0,
                  }}
                >
                  {scene.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
            marginBottom: 60,
          }}
        >
          <section>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>📰</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>
                  今日AI快讯
                </h2>
              </div>
              <Link
                href="/news"
                style={{
                  fontSize: 13,
                  color: T.accent,
                  textDecoration: 'none',
                }}
              >
                查看更多 →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {articles.length > 0 ? articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${T.rule}`,
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.rule;
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    {article.category && (
                      <span
                        style={{
                          padding: '2px 8px',
                          background: T.primaryBg,
                          color: T.accent,
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {article.category}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: T.inkMuted }}>
                      {article.sourceName} · {formatTimeAgo(article.publishedAt)}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: T.ink,
                      margin: '0 0 8px',
                      lineHeight: 1.5,
                    }}
                  >
                    {article.title}
                  </h3>
                  {article.summary && (() => {
                    const clean = stripHtmlForDisplay(article.summary);
                    return clean ? (
                      <p
                        style={{
                          fontSize: 13,
                          color: T.inkSoft,
                          margin: 0,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {clean}
                      </p>
                    ) : null;
                  })()}
                </Link>
              )) : (
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 32,
                    border: `1px solid ${T.rule}`,
                    textAlign: 'center',
                    color: T.inkMuted,
                  }}
                >
                  暂无资讯
                </div>
              )}
            </div>
          </section>

          <section>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>💻</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>
                  GitHub本周热门
                </h2>
              </div>
              <Link
                href="/trending"
                style={{
                  fontSize: 13,
                  color: T.accent,
                  textDecoration: 'none',
                }}
              >
                完整榜单 →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {weekTrending.length > 0 ? weekTrending.map((repo, index) => (
                <a
                  key={repo.repo}
                  href={`https://github.com/${repo.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${T.rule}`,
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.rule;
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: index === 0 ? T.accent : T.bg,
                        color: index === 0 ? '#fff' : T.inkMuted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: T.ink,
                      }}
                    >
                      {repo.repo}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: T.inkSoft,
                      margin: '0 0 12px',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {repo.descZh || repo.desc}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      fontSize: 12,
                      color: T.inkMuted,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#F59E0B' }}>★</span>
                      {repo.stars.toLocaleString()}
                    </span>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>
                      +{repo.gained.toLocaleString()}
                    </span>
                    {repo.lang && (
                      <span
                        style={{
                          padding: '2px 8px',
                          background: T.bg,
                          borderRadius: 4,
                        }}
                      >
                        {repo.lang}
                      </span>
                    )}
                  </div>
                </a>
              )) : (
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 32,
                    border: `1px solid ${T.rule}`,
                    textAlign: 'center',
                    color: T.inkMuted,
                  }}
                >
                  暂无数据
                </div>
              )}
            </div>
          </section>
        </div>

        {events.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>⚡</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>最新 AI 事件</h2>
              </div>
              <Link href="/events" style={{ fontSize: 13, color: T.accent, textDecoration: 'none' }}>
                查看全部 →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 16 }}>
              {events.map((ev) => (
                <Link key={ev.id} href={`/events/${ev.slug}`} style={{ background: '#fff', border: `1px solid ${T.rule}`, borderRadius: 12, padding: 18, textDecoration: 'none', display: 'block', transition: 'border-color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.rule; }}
                >
                  <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginBottom: 6 }}>
                    AI 事件 · {formatTimeAgo(ev.publishedAt)}
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: T.ink, lineHeight: 1.45 }}>
                    {ev.title}
                  </h3>
                  {ev.summary && (
                    <p style={{ margin: 0, fontSize: 13, color: T.inkSoft, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {ev.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginBottom: 60 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🏆</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: T.ink, margin: 0 }}>
                热门工具榜单
              </h2>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {[
              { title: '免费AI工具推荐（全品类）', icon: '💰', href: '/best/free-ai-tools' },
              { title: '国内可直连AI工具', icon: '🇨🇳', href: '/best/cn-accessible-tools' },
              { title: 'AI写作工具推荐', icon: '✍️', href: '/best/ai-writing-tools' },
              { title: 'AI编程工具推荐', icon: '💻', href: '/best/ai-coding-tools' },
            ].map((rank) => (
              <Link
                key={rank.title}
                href={rank.href}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 20,
                  border: `1px solid ${T.rule}`,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.accent;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.rule;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ fontSize: 32 }}>{rank.icon}</span>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: T.ink,
                      margin: 0,
                    }}
                  >
                    {rank.title}
                  </h3>
                </div>
                <span style={{ fontSize: 20, color: T.inkMuted }}>→</span>
              </Link>
            ))}
          </div>
        </section>

        <section
          style={{
            background: `linear-gradient(135deg, ${T.accent}, #EA580C)`,
            borderRadius: 20,
            padding: '48px 32px',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>
            找不到合适的 AI 工具？
          </h2>
          <p style={{ fontSize: 16, margin: '0 0 24px', opacity: 0.9 }}>
            告诉我们你的需求，我们帮你推荐最适合的工具
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link
              href="/submit-guide"
              style={{
                padding: '14px 28px',
                background: '#fff',
                color: T.accent,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              提交工具
            </Link>
            <Link
              href="/contact"
              style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              商务合作
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
