'use client';

import { useEffect, useState } from 'react';

/**
 * PWAOfflineBanner — v2.3.0
 * Hiển thị banner nổi ở trên cùng khi thiết bị mất kết nối internet.
 * Tự động ẩn đi khi kết nối được khôi phục.
 */
export default function PWAOfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
      setWasOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [wasOffline]);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        backgroundColor: isOffline ? '#FEF3C7' : '#ECFDF5',
        borderBottom: isOffline ? '2px solid #F59E0B' : '2px solid #10B981',
        color: isOffline ? '#92400E' : '#065F46',
      }}
    >
      <span style={{ fontSize: '18px' }}>{isOffline ? '📡' : '✅'}</span>
      {isOffline ? (
        <span>
          Bạn đang <strong>offline</strong> — Đang xem bản cache. Một số tính năng AI cần kết nối mạng.
        </span>
      ) : (
        <span>
          <strong>Đã kết nối lại!</strong> Các tính năng AI đã sẵn sàng.
        </span>
      )}
    </div>
  );
}
