import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') ?? 'default';
  const name = searchParams.get('name') ?? 'AIBoxPro';
  const sub = searchParams.get('sub') ?? '';
  const brand = searchParams.get('brand') ?? '#F97316';
  const mono = searchParams.get('mono') ?? 'A';
  const title = searchParams.get('title') ?? name;
  const tag = searchParams.get('tag') ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FFF7ED',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -120,
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -80,
            bottom: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '40px 56px 0' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 22,
              fontStyle: 'italic',
            }}
          >
            A
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', letterSpacing: '-0.02em' }}>
            AIBoxPro
          </span>
          <span style={{ fontSize: 16, color: '#9CA3AF', fontStyle: 'italic' }}>
            · 中文 AI 工具决策平台
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 56px' }}>
          {type === 'tool' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 24,
                  background: brand,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: mono.length === 1 ? 48 : 30,
                  letterSpacing: '-0.04em',
                  flexShrink: 0,
                }}
              >
                {mono}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 52, fontWeight: 700, fontStyle: 'italic', color: '#1F2937', letterSpacing: '-0.03em' }}>
                  {name}
                </span>
                <span style={{ fontSize: 22, color: '#4B5563', lineHeight: 1.4 }}>{sub}</span>
              </div>
            </div>
          )}

          {type === 'news' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tag && (
                <div
                  style={{
                    display: 'flex',
                    alignSelf: 'flex-start',
                    padding: '4px 14px',
                    borderRadius: 999,
                    background: '#FFEDD5',
                    color: '#C2410C',
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {tag}
                </div>
              )}
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: '#1F2937',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  maxWidth: 800,
                }}
              >
                {title}
              </span>
            </div>
          )}

          {type === 'default' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: '#1F2937',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                选 AI 工具，
                <br />
                <span style={{ color: '#F97316' }}>先看 AIBoxPro</span>
              </span>
              <span style={{ fontSize: 22, color: '#4B5563' }}>
                价格、中文支持、国内使用情况、适合场景与替代方案
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 56px',
            borderTop: '1px solid #E8D5B7',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          <span style={{ fontSize: 15, color: '#9CA3AF' }}>aiboxpro.cn</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: '#FFEDD5' }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#F97316', display: 'flex' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#C2410C' }}>AIBOXPRO</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
