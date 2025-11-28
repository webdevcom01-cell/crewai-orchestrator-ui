import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface FeedItem {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  duration?: string;
}

interface NeuralFeedProps {
  items?: FeedItem[];
  title?: string;
  maxItems?: number;
  className?: string;
  autoGenerate?: boolean;
}

const defaultMessages = [
  { type: 'DB', message: 'Vector index rebalancing' },
  { type: 'SYSTEM', message: 'Optimizing RAG context window' },
  { type: 'API', message: 'Embedding generation complete' },
  { type: 'CACHE', message: 'Memory consolidation active' },
  { type: 'MODEL', message: 'Attention weights calibrated' },
  { type: 'QUEUE', message: 'Task pipeline synchronized' },
];

const NeuralFeed: React.FC<NeuralFeedProps> = ({
  items: propItems,
  title = 'Neural Feed // Live',
  maxItems = 3,
  className = '',
  autoGenerate = true,
}) => {
  const [items, setItems] = useState<FeedItem[]>(propItems || []);

  useEffect(() => {
    if (!autoGenerate || propItems) return;

    // Generate initial item
    const generateItem = (): FeedItem => {
      const msg = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
      const now = new Date();
      return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`,
        type: msg.type,
        message: msg.message,
        duration: `T: ${Math.floor(Math.random() * 500 + 100)}ms`,
      };
    };

    setItems([generateItem()]);

    // Add new items periodically
    const interval = setInterval(() => {
      setItems((prev) => {
        const newItems = [generateItem(), ...prev].slice(0, maxItems);
        return newItems;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoGenerate, propItems, maxItems]);

  return (
    <div className={`neural-feed ${className}`}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#6B7280',
          marginBottom: '12px',
        }}
      >
        <Zap
          size={14}
          style={{
            color: '#22C55E',
            animation: 'blink 1s infinite',
          }}
        />
        <span>{title}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'rgba(8, 15, 26, 0.6)',
              border: '1px solid rgba(34, 197, 220, 0.15)',
              borderRadius: '8px',
              fontFamily: "'Space Mono', monospace",
              opacity: 1 - index * 0.2,
              animation: index === 0 ? 'fadeIn 0.3s ease-out' : 'none',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: '#22C5DC' }}>
                {item.timestamp} {item.type}
              </span>
              <span style={{ fontSize: '13px', color: '#FFFFFF' }}>
                {item.message}
              </span>
            </div>
            {item.duration && (
              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                {item.duration}
              </span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NeuralFeed;
