import React from 'react';
import { TrendingUp, Bot, Globe, BookOpen, MessageSquare } from 'lucide-react';
import { YoutubeIcon, GithubIcon } from './Icons';

export default function BookmarksBar({ bookmarks, onNavigate }) {
  const defaultItems = [
    {
      title: 'YouTube (Sin Anuncios)',
      url: 'https://www.youtube.com',
      icon: <YoutubeIcon size={14} color="#FF0000" />
    },
    {
      title: 'Binance',
      url: 'https://www.binance.com',
      icon: <TrendingUp size={13} color="#F0B90B" />
    },
    {
      title: 'ChatGPT',
      url: 'https://chatgpt.com',
      icon: <Bot size={13} color="#10A37F" />
    },
    {
      title: 'GitHub',
      url: 'https://github.com',
      icon: <GithubIcon size={13} color="var(--text-primary)" />
    },
    {
      title: 'Reddit',
      url: 'https://reddit.com',
      icon: <MessageSquare size={13} color="#FF4500" />
    },
    {
      title: 'Wikipedia',
      url: 'https://es.wikipedia.org',
      icon: <BookOpen size={13} color="var(--text-secondary)" />
    }
  ];

  const allItems = [...defaultItems, ...(bookmarks || [])];

  return (
    <div style={styles.bar}>
      {allItems.map((item, index) => (
        <button
          key={index}
          style={styles.item}
          onClick={() => onNavigate(item.url)}
          title={item.url}
        >
          <span style={styles.icon}>{item.icon || <Globe size={13} color="var(--accent)" />}</span>
          <span style={styles.title}>{item.title}</span>
        </button>
      ))}
    </div>
  );
}

const styles = {
  bar: {
    height: 'var(--bookmarks-height)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0 12px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
    overflowX: 'auto',
    overflowY: 'hidden',
    zIndex: 30
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 8px',
    height: '24px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  },
  icon: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};
