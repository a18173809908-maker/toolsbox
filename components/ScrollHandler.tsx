'use client';

import { useEffect, useRef } from 'react';

export function ScrollHandler() {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const progressBar = progressBarRef.current;
    const backToTop = backToTopRef.current;

    if (!progressBar || !backToTop) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = scrollPercent + '%';

      if (scrollTop > 300) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.visibility = 'hidden';
      }
    };

    const handleClick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('scroll', handleScroll);
    backToTop.addEventListener('click', handleClick);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      backToTop.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      <div
        ref={progressBarRef}
        id="progress-bar"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: '#E8D5B7', zIndex: 50 }}
      >
        <div style={{ height: '100%', background: '#F97316', transition: 'width .15s' }} />
      </div>

      <button
        ref={backToTopRef}
        id="back-to-top"
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: '#F97316',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          opacity: 0,
          visibility: 'hidden',
          transition: 'all .3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
          zIndex: 50,
        }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
}