'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { ToolIcon } from '@/components/ToolBadges';
import { v2Tokens as T } from '@/lib/tokens';


// 模拟数据
const mockTools = [
  {
    id: 1,
    name: '豆包',
    slug: 'doubao',
    logo: 'https://cdn.aiboxpro.cn/logos/doubao.png',
    shortDesc: '字节跳动推出的全能AI助手，支持智能对话、文案创作、图片生成',
    pricing: '免费增值',
    chinaAccessible: true,
    supportChinese: true,
    category: 'AI助手',
    tags: ['智能对话', '文案创作', '图片生成'],
    rating: 4.8,
    isEditorPick: true,
    targetUsers: ['自媒体', '办公人员', '学生'],
  },
  {
    id: 2,
    name: '可灵AI',
    slug: 'keling',
    logo: 'https://cdn.aiboxpro.cn/logos/keling.png',
    shortDesc: '快手推出的AI视频生成工具，支持文生视频、图生视频',
    pricing: '免费增值',
    chinaAccessible: true,
    supportChinese: true,
    category: '视频创作',
    tags: ['文生视频', '图生视频', '数字人'],
    rating: 4.6,
    isEditorPick: true,
    targetUsers: ['视频创作者', '自媒体', '电商'],
  },
  {
    id: 3,
    name: '即梦AI',
    slug: 'jimeng',
    logo: 'https://cdn.aiboxpro.cn/logos/jimeng.png',
    shortDesc: '字节跳动推出的AI创作平台，支持文字生成图片和视频',
    pricing: '免费增值',
    chinaAccessible: true,
    supportChinese: true,
    category: '图像生成',
    tags: ['文生图', '图生图', '视频生成'],
    rating: 4.7,
    isEditorPick: true,
    targetUsers: ['设计师', '自媒体', '电商'],
  },
  {
    id: 4,
    name: 'Claude',
    slug: 'claude',
    logo: 'https://cdn.aiboxpro.cn/logos/claude.png',
    shortDesc: 'Anthropic推出的安全、有用、诚实的AI助手，擅长长文本思考',
    pricing: 'Freemium',
    chinaAccessible: false,
    supportChinese: true,
    category: 'AI助手',
    tags: ['长文本', '代码辅助', '多模态'],
    rating: 4.9,
    isEditorPick: true,
    targetUsers: ['开发者', '研究人员', '专业用户'],
  },
  {
    id: 5,
    name: 'ChatGPT',
    slug: 'chatgpt',
    logo: 'https://cdn.aiboxpro.cn/logos/chatgpt.png',
    shortDesc: 'OpenAI旗舰对话模型，覆盖日常问答、编程与创意写作',
    pricing: 'Freemium',
    chinaAccessible: false,
    supportChinese: true,
    category: 'AI助手',
    tags: ['对话', '编程', '创意写作'],
    rating: 4.8,
    isEditorPick: true,
    targetUsers: ['通用用户', '开发者', '创作者'],
  },
  {
    id: 6,
    name: 'Cursor',
    slug: 'cursor',
    logo: 'https://cdn.aiboxpro.cn/logos/cursor.png',
    shortDesc: 'AI优先的代码编辑器，编辑器本体国内可用，支持多种模型',
    pricing: 'Freemium',
    chinaAccessible: true,
    supportChinese: false,
    category: '编程开发',
    tags: ['代码生成', '代码补全', '多文件编辑'],
    rating: 4.9,
    isEditorPick: true,
    targetUsers: ['开发者', '程序员', '技术团队'],
  },
  {
    id: 7,
    name: 'Midjourney',
    slug: 'midjourney',
    logo: 'https://cdn.aiboxpro.cn/logos/midjourney.png',
    shortDesc: '业界领先的AI图像生成工具，艺术风格独特，社区活跃',
    pricing: '付费',
    chinaAccessible: false,
    supportChinese: false,
    category: '图像生成',
    tags: ['文生图', '艺术创作', '设计'],
    rating: 4.7,
    isEditorPick: false,
    targetUsers: ['设计师', '艺术家', '创意工作者'],
  },
  {
    id: 8,
    name: 'Kimi',
    slug: 'kimi',
    logo: 'https://cdn.aiboxpro.cn/logos/kimi.png',
    shortDesc: '月之暗面推出的长文本AI助手，支持200万字上下文',
    pricing: '免费增值',
    chinaAccessible: true,
    supportChinese: true,
    category: 'AI助手',
    tags: ['长文本', '文档处理', '联网搜索'],
    rating: 4.6,
    isEditorPick: false,
    targetUsers: ['研究人员', '办公人员', '学生'],
  },
  {
    id: 9,
    name: 'Runway',
    slug: 'runway',
    logo: 'https://cdn.aiboxpro.cn/logos/runway.png',
    shortDesc: '专业级AI视频生成和编辑平台，功能强大，适合专业制作',
    pricing: 'Freemium',
    chinaAccessible: false,
    supportChinese: false,
    category: '视频创作',
    tags: ['视频生成', '视频编辑', '特效'],
    rating: 4.5,
    isEditorPick: false,
    targetUsers: ['视频制作', '影视后期', '专业创作者'],
  },
];

const mockNews = [
  {
    id: 1,
    title: 'OpenAI 发布 GPT-5 预览版，多模态能力大幅提升',
    summary: 'GPT-5在图像理解、视频生成和代码能力上都有显著进步，预计Q3正式发布',
    source: 'AI前线',
    time: '2小时前',
    category: '模型发布',
  },
  {
    id: 2,
    title: '字节跳动推出即梦AI 2.0，视频生成质量媲美Runway',
    summary: '新版本支持4K视频生成，生成速度提升3倍，已向所有用户开放',
    source: '36氪',
    time: '5小时前',
    category: '产品更新',
  },
  {
    id: 3,
    title: 'GitHub Copilot 新增 Agent 模式，可自动修复Bug',
    summary: '新功能允许Copilot主动识别代码问题并提交修复建议，大幅提升开发效率',
    source: '开发者头条',
    time: '8小时前',
    category: '产品更新',
  },
];

const mockGithub = [
  {
    id: 1,
    name: 'anthropics/financial-services',
    description: '智能体性能优化系统，为Claude Code、Codex等提供技能、本能、记忆、安全与...',
    stars: '12.5k',
    growth: '+1.4k',
    language: 'Python',
  },
  {
    id: 2,
    name: 'affaan-m/everything-claude-code',
    description: 'Claude Code完整指南，包含最佳实践、提示词模板和高级技巧',
    stars: '8.3k',
    growth: '+1.1k',
    language: 'TypeScript',
  },
  {
    id: 3,
    name: 'addyosmani/agent-skills',
    description: '面向AI编码智能体的生产级工程技能，可作为Shell生态、AI Agent架构...',
    stars: '6.7k',
    growth: '+980',
    language: 'JavaScript',
  },
];

const sceneSolutions = [
  { title: '做小红书内容', icon: '📝', desc: '文案+图片+视频一站式', tools: 12 },
  { title: '写代码', icon: '💻', desc: 'AI编程助手推荐', tools: 8 },
  { title: '做PPT', icon: '📊', desc: 'AI生成演示文稿', tools: 6 },
  { title: '做视频', icon: '🎬', desc: 'AI视频生成工具', tools: 15 },
  { title: '做设计', icon: '🎨', desc: 'AI绘图+设计工具', tools: 10 },
  { title: '写文案', icon: '✍️', desc: 'AI写作工具合集', tools: 9 },
];

const quickTags = ['免费工具', '国内可用', 'AI写作', 'AI绘图', '编程助手', '视频创作', '办公效率'];

export default function DemoPage() {
  const [searchQuery, setSearchQuery] = useState('');

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
      
      {/* 首屏区域 */}
      <section
        style={{
          background: 'transparent',
          padding: '60px 20px 80px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* 定位语 */}
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

          {/* 搜索框 */}
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

          {/* 热门标签 */}
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
                key={tag}
                href={`/tools?tag=${encodeURIComponent(tag)}`}
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
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 主体内容区 */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* 编辑推荐 */}
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
                精选 9 个
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
            {mockTools.slice(0, 9).map((tool) => (
              <div
                key={tool.id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  border: `1px solid ${T.rule}`,
                  transition: 'all 0.3s',
                  cursor: 'pointer',
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
                {/* 徽章 */}
                {tool.isEditorPick && (
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
                )}

                {/* 头部 */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: T.primaryBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      flexShrink: 0,
                    }}
                  >
                    {tool.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: T.ink,
                          margin: 0,
                        }}
                      >
                        {tool.name}
                      </h3>
                      <span style={{ fontSize: 14, color: '#F59E0B' }}>
                        {'★'.repeat(Math.floor(tool.rating))}
                        <span style={{ color: T.inkMuted }}>
                          {tool.rating}
                        </span>
                      </span>
                    </div>
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
                        {tool.pricing}
                      </span>
                      {tool.chinaAccessible && (
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

                {/* 描述 */}
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
                  {tool.shortDesc}
                </p>

                {/* 标签 */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {tool.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 10px',
                        background: T.bg,
                        color: T.inkMuted,
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 适合人群 */}
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: `1px solid ${T.rule}`,
                    fontSize: 12,
                    color: T.inkMuted,
                  }}
                >
                  适合：{tool.targetUsers.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 场景解决方案 */}
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
                href={`/use-cases/${encodeURIComponent(scene.title)}`}
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
                    margin: '0 0 12px',
                  }}
                >
                  {scene.desc}
                </p>
                <span
                  style={{
                    padding: '4px 12px',
                    background: T.primaryBg,
                    color: T.accent,
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {scene.tools} 个工具
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 两栏布局：AI快讯 + GitHub趋势 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
            marginBottom: 60,
          }}
        >
          {/* AI快讯 */}
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
              {mockNews.map((news) => (
                <div
                  key={news.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${T.rule}`,
                    cursor: 'pointer',
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
                      {news.category}
                    </span>
                    <span style={{ fontSize: 12, color: T.inkMuted }}>
                      {news.source} · {news.time}
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
                    {news.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: T.inkSoft,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {news.summary}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* GitHub趋势 */}
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
              {mockGithub.map((repo, index) => (
                <div
                  key={repo.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${T.rule}`,
                    cursor: 'pointer',
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
                      {repo.name}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: T.inkSoft,
                      margin: '0 0 12px',
                      lineHeight: 1.5,
                    }}
                  >
                    {repo.description}
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
                      {repo.stars}
                    </span>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>
                      {repo.growth}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        background: T.bg,
                        borderRadius: 4,
                      }}
                    >
                      {repo.language}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 工具榜单入口 */}
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
              { title: '免费AI工具合集', count: 45, icon: '💰' },
              { title: '国内可用AI工具', count: 32, icon: '🇨🇳' },
              { title: 'AI写作工具排行', count: 18, icon: '✍️' },
              { title: 'AI编程工具排行', count: 12, icon: '💻' },
            ].map((rank) => (
              <Link
                key={rank.title}
                href={`/best/${encodeURIComponent(rank.title)}`}
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
                      margin: '0 0 4px',
                    }}
                  >
                    {rank.title}
                  </h3>
                  <span style={{ fontSize: 13, color: T.inkMuted }}>
                    {rank.count} 个工具
                  </span>
                </div>
                <span style={{ fontSize: 20, color: T.inkMuted }}>→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA区域 */}
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
