import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../api';
import { apiRoutes } from '../routes/apiRoutes';
import { clearStoredUser, getStoredUser, storeUser } from '../utils/auth';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-mode' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
      style={{
        background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
        color: theme === 'dark' ? '#fff' : '#333',
        padding: '8px 16px',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        transition: 'all 0.2s ease'
      }}
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};

const AdminIcon = ({ name, size = 18 }) => {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };

  const icons = {
    dashboard: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="4" rx="1.5" />
        <rect x="14" y="10" width="7" height="11" rx="1.5" />
        <rect x="3" y="13" width="7" height="8" rx="1.5" />
      </svg>
    ),
    users: (
      <svg {...iconProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    graduation: (
      <svg {...iconProps}>
        <path d="m2 8 10-5 10 5-10 5Z" />
        <path d="M6 10.6v4.4c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.4" />
      </svg>
    ),
    clipboard: (
      <svg {...iconProps}>
        <rect x="8" y="3" width="8" height="4" rx="1" />
        <path d="M9 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
    spark: (
      <svg {...iconProps}>
        <path d="m13 2-2 7h4l-4 13 2-8H9z" />
      </svg>
    ),
    swap: (
      <svg {...iconProps}>
        <path d="M16 3h5v5" />
        <path d="m21 3-7 7" />
        <path d="M8 21H3v-5" />
        <path d="m3 21 7-7" />
      </svg>
    ),
    calendar: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 11h18" />
      </svg>
    ),
    wallet: (
      <svg {...iconProps}>
        <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2Z" />
        <path d="M18 9h3v6h-3a2 2 0 0 1 0-6Z" />
        <path d="M18 7V5a2 2 0 0 0-2-2H6" />
      </svg>
    ),
    ticket: (
      <svg {...iconProps}>
        <path d="M4 9V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4Z" />
        <path d="M9 9h.01" />
        <path d="M15 15h.01" />
      </svg>
    ),
    scale: (
      <svg {...iconProps}>
        <path d="M12 3v18" />
        <path d="M7 21h10" />
        <path d="M5 7h14" />
        <path d="m7 7-3 5a3 3 0 0 0 6 0Z" />
        <path d="m17 7-3 5a3 3 0 0 0 6 0Z" />
      </svg>
    ),
    content: (
      <svg {...iconProps}>
        <path d="M14 3h7v7" />
        <path d="M10 14 21 3" />
        <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      </svg>
    ),
    megaphone: (
      <svg {...iconProps}>
        <path d="m3 11 12-5v12L3 13z" />
        <path d="M15 8h3a3 3 0 0 1 0 6h-3" />
        <path d="m6 13 2 6" />
      </svg>
    ),
    analytics: (
      <svg {...iconProps}>
        <path d="M4 19V5" />
        <path d="M10 19v-8" />
        <path d="M16 19v-4" />
        <path d="M22 19V9" />
      </svg>
    ),
    settings: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-.33-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.33H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1-.33 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6c.38-.16.7-.43.9-.77.2-.34.3-.73.27-1.12V3a2 2 0 1 1 4 0v.09c-.03.39.07.78.27 1.12.2.34.52.61.9.77a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.16.38.43.7.77.9.34.2.73.3 1.12.27H21a2 2 0 1 1 0 4h-.09c-.39-.03-.78.07-1.12.27-.34.2-.61.52-.77.9Z" />
      </svg>
    ),
    star: (
      <svg {...iconProps}>
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z" />
      </svg>
    ),
    logs: (
      <svg {...iconProps}>
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
      </svg>
    ),
    chevron: (
      <svg {...iconProps}>
        <path d="m9 6 6 6-6 6" />
      </svg>
    )
  };

  return icons[name] || icons.dashboard;
};

const getSidebarSectionForPath = (pathname) => {
  if (pathname.includes('/credits') || pathname.includes('/support') || pathname.includes('/disputes')) return 'finance';
  if (pathname.includes('/content') || pathname.includes('/announcements')) return 'content';
  if (pathname.includes('/reports') || pathname.includes('/settings') || pathname.includes('/feedback') || pathname.includes('/logs')) return 'system';
  return 'core';
};

// --- Styled Components for Dashboard ---
const SidebarItem = ({ icon, label, to, active, badgeCount = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', margin: '4px 12px',
        textDecoration: 'none', color: active ? '#fff' : (isHovered ? '#e5e7eb' : '#9ca3af'),
        background: active ? 'linear-gradient(135deg, #646cff 0%, #bc13fe 100%)' : (isHovered ? 'rgba(255,255,255,0.05)' : 'transparent'),
        borderRadius: '8px',
        transition: 'all 0.2s ease', fontSize: '0.95rem', fontWeight: active ? '600' : '500',
        position: 'relative',
        boxShadow: active ? '0 4px 10px rgba(100,108,255,0.3)' : 'none'
      }}
    >
      <span style={{
        width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.2s ease', transform: isHovered || active ? 'scale(1.08)' : 'scale(1)'
      }}>
        {icon}
      </span>
      <span>{label}</span>
      {badgeCount > 0 && (
        <span style={{
          marginLeft: 'auto', background: active ? 'rgba(255,255,255,0.2)' : '#ef4444', color: '#fff',
          borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold',
          padding: '2px 8px', lineHeight: '1.2'
        }}>
          {badgeCount}
        </span>
      )}
    </Link>
  );
};

const SidebarSection = ({ title, icon, isOpen, onToggle, active, children }) => (
  <div style={{ margin: '0 12px 8px' }}>
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        background: isOpen || active ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
        color: isOpen || active ? '#fff' : '#cbd5e1',
        border: `1px solid ${isOpen || active ? 'rgba(129, 140, 248, 0.28)' : 'rgba(255,255,255,0.04)'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: isOpen || active ? '0 10px 24px rgba(15, 23, 42, 0.22)' : 'none'
      }}
    >
      <span style={{ width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: '0.92rem', fontWeight: '700' }}>{title}</div>
        <div style={{ fontSize: '0.72rem', color: isOpen || active ? '#a5b4fc' : '#64748b', marginTop: '2px' }}>Click to view links</div>
      </div>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.25s ease'
      }}>
        <AdminIcon name="chevron" size={16} />
      </span>
    </button>

    <div style={{
      maxHeight: isOpen ? '520px' : '0px',
      opacity: isOpen ? 1 : 0,
      overflow: 'hidden',
      transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
      transition: 'max-height 0.32s ease, opacity 0.22s ease, transform 0.22s ease',
      paddingTop: isOpen ? '10px' : '0px'
    }}>
      <div style={{ borderLeft: '1px solid rgba(99,102,241,0.18)', marginLeft: '18px', paddingLeft: '2px' }}>
        {children}
      </div>
    </div>
  </div>
);

const StatCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;

      if (progress < duration) {
        const percentage = 1 - Math.pow(1 - Math.min(1, progress / duration), 4);
        setCount(Math.floor(percentage * end));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
};

const StatCard = ({ title, value, icon, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#1f2937', padding: '24px', borderRadius: '12px',
        boxShadow: isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease', transform: isHovered ? 'translateY(-4px)' : 'none', cursor: 'default'
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '8px',
        background: `${color}20`, color: color, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '1rem',
        transition: 'transform 0.3s ease', transform: isHovered ? 'scale(1.1)' : 'scale(1)'
      }}>
        {icon}
      </div>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0 0 4px 0', fontWeight: '500' }}>{title}</p>
      <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff', margin: 0 }}>
        {typeof value === 'number' ? <StatCounter end={value} /> : value}
      </h3>
    </div>
  );
};

const SimpleLineChart = ({ data, color }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '2%', padding: '10px 0' }}>
      {data.map((val, idx) => (
        <div key={idx} style={{
          width: '100%',
          height: show ? `${val}%` : '0%',
          background: `linear-gradient(to top, ${color}40, ${color})`,
          borderRadius: '4px 4px 0 0',
          transition: `height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.05}s`
        }}></div>
      ))}
    </div>
  );
};

const PieChart = ({ data, title }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const duration = 1500;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const p = currentTime - startTime;
      if (p < duration) {
        setProgress(1 - Math.pow(1 - Math.min(1, p / duration), 4));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setProgress(1);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const backgroundGradient = data.map((item, index) => {
    let start = data.slice(0, index).reduce((sum, i) => sum + i.percentage, 0) * progress;
    let end = start + item.percentage * progress;
    return `${item.color} ${start}% ${end}%`;
  }).join(', ');

  const gradientString = `conic-gradient(${backgroundGradient}, transparent ${100 * progress}%)`;

  return (
    <div style={{
      background: '#1f2937', padding: '24px', borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      display: 'flex', flexDirection: 'column', height: '100%'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem', fontWeight: '600' }}>{title}</h3>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', flex: 1 }}>

        {/* Modern Donut Chart */}
        <div style={{
          position: 'relative',
          width: '170px', height: '170px', borderRadius: '50%',
          background: gradientString,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {/* Inner Cutout for Donut effect */}
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%', // Size of the hollow center
            background: '#1f2937',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.4)'
          }}>
            <span style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', opacity: progress }}>
              Total
            </span>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.4rem', opacity: progress }}>
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: progress, transition: 'opacity 1s ease', minWidth: '150px' }}>
          {data.map(item => (
            <div key={item.label}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color, boxShadow: `0 0 10px ${item.color}80` }}></div>
              <span style={{ color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>{item.label}</span>
              <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', marginLeft: 'auto', paddingLeft: '15px' }}>{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlaceholderPage = ({ title, icon }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#6b7280', animation: 'fadeInUp 0.5s ease' }}>
    <div style={{ textAlign: 'center', background: '#1f2937', padding: '4rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'grayscale(80%)', opacity: 0.6 }}>{icon}</div>
      <h2 style={{ color: '#e5e7eb', margin: '0 0 0.5rem 0' }}>{title} Page</h2>
      <p>This feature is currently under construction. Check back soon!</p>
    </div>
  </div>
);

const ActionButton = ({ onClick, title, icon, color = '#9ca3af' }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: color, padding: '6px', borderRadius: '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.2s ease, transform 0.2s ease'
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
  >
    {icon}
  </button>
);

const NotificationsDropdown = () => (
  <div className="admin-hover-dropdown" style={{
    position: 'absolute', top: '40px', right: '-10px',
    background: '#1f2937', borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    width: '320px', zIndex: 20, border: '1px solid #374151',
    animation: 'fadeInUp 0.2s ease-out', cursor: 'default', color: '#fff', textAlign: 'left'
  }} onClick={e => e.stopPropagation()}>
    <div style={{ padding: '16px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Notifications</h4>
      <span style={{ fontSize: '0.8rem', color: '#646cff', cursor: 'pointer' }}>Mark all read</span>
    </div>
    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
      {[
        { title: 'New User Registered', desc: 'Alice joined the platform', time: '5m ago', color: '#10b981' },
        { title: 'Swap Request Pending', desc: 'Bob wants to learn React', time: '1h ago', color: '#f59e0b' },
        { title: 'System Alert', desc: 'High CPU usage detected', time: '2h ago', color: '#ef4444' }
      ].map((notif, i) => (
        <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.color, marginTop: '6px', flexShrink: 0 }}></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#e5e7eb', fontWeight: '500' }}>{notif.title}</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: '#9ca3af' }}>{notif.desc}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{notif.time}</p>
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #374151' }}>
      <Link to="/super-admin/logs" style={{ color: '#d1d5db', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }}>View all activities</Link>
    </div>
  </div>
);

const MessagesDropdown = () => (
  <div className="admin-hover-dropdown" style={{
    position: 'absolute', top: '40px', right: '-10px',
    background: '#1f2937', borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    width: '320px', zIndex: 20, border: '1px solid #374151',
    animation: 'fadeInUp 0.2s ease-out', cursor: 'default', color: '#fff', textAlign: 'left'
  }} onClick={e => e.stopPropagation()}>
    <div style={{ padding: '16px', borderBottom: '1px solid #374151' }}>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Recent Messages</h4>
    </div>
    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
      {[
        { initials: 'SJ', name: 'Sarah Jenkins', msg: 'The new dashboard looks great!', time: '10m', bg: '#646cff' },
        { initials: 'MT', name: 'Mike Taylor', msg: 'Could you approve my skill request?', time: '2h', bg: '#10b981' },
        { initials: 'AD', name: 'Admin Support', msg: 'Server maintenance scheduled.', time: '1d', bg: '#ef4444' }
      ].map((msg, i) => (
        <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: msg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>{msg.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e5e7eb', fontWeight: '500' }}>{msg.name}</p>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{msg.time}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.msg}</p>
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #374151' }}>
      <a href="#" onClick={e => e.preventDefault()} style={{ color: '#d1d5db', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }}>Open Messages App</a>
    </div>
  </div>
);

const ProfileDropdown = ({ onLogout }) => (
  <div className="admin-hover-dropdown" style={{
    position: 'absolute', top: '60px', right: 0,
    background: '#1f2937', borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    width: '220px', zIndex: 20, border: '1px solid #374151',
    animation: 'fadeInUp 0.2s ease-out', cursor: 'default', textAlign: 'left'
  }} onClick={e => e.stopPropagation()}>
    <div style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>
      <p style={{ margin: 0, fontWeight: '600', color: '#fff' }}>Akshit Kansal</p>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>Super Admin</p>
    </div>
    <div style={{ padding: '0.5rem' }}>
      <Link
        to="/super-admin/settings"
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        style={{ textDecoration: 'none', color: '#d1d5db', display: 'block', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.9rem', transition: 'background 0.2s ease' }}
      >
        Profile Settings
      </Link>
      <a
        href="#" onClick={e => { e.preventDefault(); onLogout(); }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        style={{ textDecoration: 'none', color: '#ef4444', display: 'block', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.9rem', transition: 'background 0.2s ease' }}
      >
        Logout
      </a>
    </div>
  </div>
);

// --- Main Component ---
const SuperAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSidebarSection, setOpenSidebarSection] = useState(() => getSidebarSectionForPath(location.pathname));
  const [stats, setStats] = useState({ totalUsers: 0, totalSkills: 0, totalSwaps: 0, activeSwaps: 154 });
  const [allUsers, setAllUsers] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [verifierApps, setVerifierApps] = useState([]);
  const [skillApprovalRequests, setSkillApprovalRequests] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [allAdminReports, setAllAdminReports] = useState([]);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });
  const [adminAvatar, setAdminAvatar] = useState(null);
  const [adminProfileForm, setAdminProfileForm] = useState({ name: '', email: '', password: '' });
  const [platformConfig, setPlatformConfig] = useState({ title: 'SkillSwap', supportEmail: 'support@skillswap.com', defaultCredits: 5, allowReg: true, maintenance: false });
  const [contents, setContents] = useState([
    { title: 'Terms of Service', lastUpdated: '2 weeks ago', text: 'Welcome to SkillSwap Terms of Service...' },
    { title: 'Privacy Policy', lastUpdated: '2 weeks ago', text: 'SkillSwap Privacy Policy...' },
    { title: 'Community Guidelines', lastUpdated: '2 weeks ago', text: 'SkillSwap Community Guidelines...' },
    { title: 'Landing Page Hero Copy', lastUpdated: '2 weeks ago', text: 'Unlock Your Potential with Skillswap' },
    { title: 'Email Templates', lastUpdated: '2 weeks ago', text: 'Hello User,\nWelcome to SkillSwap!' }
  ]);
  const [editingContent, setEditingContent] = useState(null);

  useEffect(() => {
    setOpenSidebarSection(getSidebarSectionForPath(location.pathname));
  }, [location.pathname]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const user = getStoredUser();
      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('avatar', file);

      try {
        const response = await fetch(buildApiUrl('/api/user/avatar'), {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (response.ok) {
          storeUser(data.user);
          setAdminAvatar(buildApiUrl(data.user.avatar.replace(/\\/g, '/')));
          alert('Avatar updated successfully!');
        } else {
          alert(data.message || 'Failed to update avatar');
        }
      } catch (err) {
        console.error(err);
        alert('Error updating avatar');
      }
    }
  };

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillForm, setSkillForm] = useState({ skillName: '', providerName: 'System' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' });
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Verifier App Review State
  const [showVerifierModal, setShowVerifierModal] = useState(false);
  const [selectedVerifierApp, setSelectedVerifierApp] = useState(null);
  const [isVerifierProofChecked, setIsVerifierProofChecked] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [selectedSkillApproval, setSelectedSkillApproval] = useState(null);
  const [showSkillApprovalModal, setShowSkillApprovalModal] = useState(false);
  const [skillReviewSchedule, setSkillReviewSchedule] = useState({ date: '', time: '06:00 PM' });

  // Mock Data for Chart
  const userGrowthData = [20, 35, 45, 50, 65, 75, 85, 90, 80, 95];

  useEffect(() => {
    const user = getStoredUser();
    if (!user || (user.role !== 'Main Admin' && user.role !== 'Super Admin')) {
      navigate('/admin/login');
    } else {
      setAdminProfileForm({ name: user.name || '', email: user.email || '', password: '' });
      if (user.avatar) {
        setAdminAvatar(buildApiUrl(user.avatar.replace(/\\/g, '/')));
      }
    }
  }, [navigate]);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [usersRes, statsRes, skillsRes, teachersRes, verifierRes, skillRequestsRes, sessionsRes, ratingsRes, ticketsRes, logsRes, announcementsRes, reportsRes] = await Promise.all([
        fetch(buildApiUrl('/api/admin/users')),
        fetch(buildApiUrl('/api/admin/stats')),
        fetch(buildApiUrl(apiRoutes.platform.skills)),
        fetch(buildApiUrl('/api/admin/teachers')),
        fetch(buildApiUrl('/api/verifier/applications')),
        fetch(buildApiUrl(apiRoutes.teacher.skillRequests)),
        fetch(buildApiUrl('/api/admin/sessions')),
        fetch(buildApiUrl('/api/admin/ratings')),
        fetch(buildApiUrl('/api/admin/tickets')),
        fetch(buildApiUrl('/api/admin/logs')),
        fetch(buildApiUrl('/api/admin/announcements')),
        fetch(buildApiUrl('/api/admin/reports'))
      ]);

      const usersData = await usersRes.json();
      if (usersRes.ok) setAllUsers(Array.isArray(usersData) ? usersData : []);

      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(prev => ({ ...prev, ...statsData }));

      const skillsData = await skillsRes.json();
      if (skillsRes.ok) setAllSkills(Array.isArray(skillsData) ? skillsData : []);

      const teachersData = await teachersRes.json();
      if (teachersRes.ok) setAllTeachers(Array.isArray(teachersData) ? teachersData : []);

      const verifierData = await verifierRes.json();
      if (verifierRes.ok) setVerifierApps(Array.isArray(verifierData) ? verifierData : []);

      const skillRequestsData = await skillRequestsRes.json();
      if (skillRequestsRes.ok) setSkillApprovalRequests(Array.isArray(skillRequestsData) ? skillRequestsData : []);

      if (sessionsRes.ok) setAllSessions(await sessionsRes.json());
      if (ratingsRes.ok) setAllRatings(await ratingsRes.json());
      if (ticketsRes.ok) setAllTickets(await ticketsRes.json());
      if (logsRes.ok) setAllLogs(await logsRes.json());
      if (announcementsRes.ok) setAllAnnouncements(await announcementsRes.json());
      if (reportsRes.ok) setAllAdminReports(await reportsRes.json());

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time Database Sync (Updates every 5 seconds)
    const intervalId = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    navigate('/admin/login');
  };

  const handleRemoveUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(buildApiUrl(`/api/admin/users/${userId}`), { method: 'DELETE' });
        if (response.ok) {
          alert('User removed successfully.');
          fetchData(); // Re-fetch all data to update lists and stats
        } else {
          const data = await response.json();
          alert(`Failed to remove user: ${data.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error("Remove user error:", err);
        alert('Could not connect to the server to remove user.');
      }
    }
  };

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(buildApiUrl(apiRoutes.teacher.register), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Teacher Admin Registered Successfully!');
        setShowTeacherModal(false);
        setTeacherForm({ name: '', email: '', password: '' });
        fetchData(); // Refresh the lists to show new admin
      } else {
        alert(data.message || 'Registration Failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong! Ensure server is running.');
    }
  };

  const handleAddGlobalSkill = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(buildApiUrl(apiRoutes.admin.skills), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillForm),
      });
      if (response.ok) {
        alert('Global Skill Added Successfully!');
        setShowSkillModal(false);
        setSkillForm({ skillName: '', providerName: 'System' });
        fetchData(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to add skill');
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback update if backend endpoint doesn't exist yet
      setAllSkills(prev => [...prev, { skillName: skillForm.skillName, providerName: skillForm.providerName }]);
      setShowSkillModal(false);
      setSkillForm({ skillName: '', providerName: 'System' });
      alert('Skill added locally (Server might not have this endpoint yet).');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Using the existing standard user registration route
      const response = await fetch(buildApiUrl(apiRoutes.auth.register), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      const data = await response.json();
      if (response.ok) {
        alert('User Added Successfully!');
        setShowUserModal(false);
        setUserForm({ name: '', email: '', password: '' });
        fetchData(); // Refresh list
      } else {
        alert(data.message || data.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong while adding the user!');
    }
  };

  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    const user = getStoredUser();
    try {
      const response = await fetch(buildApiUrl('/api/user/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: adminProfileForm.name, password: adminProfileForm.password, bio: user.bio, skillsWanted: user.skillsWanted })
      });
      const data = await response.json();
      if (response.ok) {
        storeUser(data.user);
        alert('Profile updated successfully!');
        setAdminProfileForm(prev => ({ ...prev, password: '' }));
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await fetch(buildApiUrl('/api/admin/config'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platformConfig)
      }).catch(e => console.log('Mocking config save since backend might not have this endpoint yet'));
      alert('Platform configuration saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving configuration');
    }
  };

  const handleSaveContent = async () => {
    try {
      await fetch(buildApiUrl('/api/admin/content'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContent)
      }).catch(e => console.log('Mocking content save'));

      setContents(prev => prev.map(c => c.title === editingContent.title ? { ...editingContent, lastUpdated: 'Just now' } : c));
      setEditingContent(null);
      alert('Content updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving content');
    }
  };

  const handleReviewVerifierApp = (app) => {
    setSelectedVerifierApp(app);
    setIsVerifierProofChecked(false);
    setShowDocumentPreview(false);
    setShowVerifierModal(true);
  };

  const handleApproveRejectApp = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) return;
    try {
      const response = await fetch(buildApiUrl(`/api/verifier/${id}/status`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        alert(`Application ${status} successfully!`);
        setShowVerifierModal(false);
        fetchData(); // Refresh lists
      } else {
        const data = await response.json();
        alert(data.message || `Failed to update status`);
      }
    } catch (error) {
      console.error('Error updating app:', error);
    }
  };

  const handleReviewSkillApproval = (request) => {
    setSelectedSkillApproval(request);
    setSkillReviewSchedule({
      date: request.reviewSession?.date ? request.reviewSession.date.split('T')[0] : '',
      time: request.reviewSession?.time || '06:00 PM',
    });
    setShowSkillApprovalModal(true);
  };

  const handleScheduleSkillReview = async () => {
    if (!selectedSkillApproval) return;
    if (!skillReviewSchedule.date || !skillReviewSchedule.time) {
      alert('Please choose review date and time.');
      return;
    }

    const admin = getStoredUser();

    try {
      const response = await fetch(buildApiUrl(apiRoutes.teacher.scheduleReviewSession), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedSkillApproval.providerId,
          skillName: selectedSkillApproval.skillName,
          date: skillReviewSchedule.date,
          time: skillReviewSchedule.time,
          adminEmail: admin?.email,
          adminName: admin?.name,
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || data.error || 'Failed to schedule skill review.');
        return;
      }
      alert('Review scheduled successfully. Teacher has been notified.');
      setSelectedSkillApproval((prev) => prev ? ({ ...prev, reviewSession: data.reviewSession }) : prev);
      fetchData(true);
    } catch (error) {
      console.error('Schedule skill review error:', error);
      alert('Could not connect to backend while scheduling review.');
    }
  };

  const handleStartSkillReview = async (request = selectedSkillApproval, openRoom = false) => {
    if (!request) return;
    const admin = getStoredUser();

    try {
      const response = await fetch(buildApiUrl(apiRoutes.teacher.startReviewSession), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: request.providerId,
          skillName: request.skillName,
          adminEmail: admin?.email,
          adminName: admin?.name,
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || data.error || 'Failed to start skill review.');
        return;
      }

      const nextRequest = { ...request, reviewSession: data.reviewSession };
      setSelectedSkillApproval(nextRequest);
      fetchData(true);

      if (openRoom) {
        navigate('/admin/verifications', { state: { openReviewRequestId: request.requestId } });
      } else {
        alert('Video interaction started. Teacher has been notified to join.');
      }
    } catch (error) {
      console.error('Start skill review error:', error);
      alert('Could not connect to backend while starting review.');
    }
  };

  const handleSkillApprovalDecision = async (status) => {
    if (!selectedSkillApproval) return;
    const admin = getStoredUser();
    const endpoint = status === 'Approved' ? apiRoutes.teacher.approveSkill : apiRoutes.teacher.rejectSkill;

    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedSkillApproval.providerId,
          skillName: selectedSkillApproval.skillName,
          adminEmail: admin?.email,
          adminName: admin?.name,
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || data.error || `Failed to ${status.toLowerCase()} skill.`);
        return;
      }
      alert(data.message || `Skill ${status.toLowerCase()} successfully.`);
      setShowSkillApprovalModal(false);
      setSelectedSkillApproval(null);
      fetchData();
    } catch (error) {
      console.error('Skill approval decision error:', error);
      alert('Could not connect to backend while updating skill approval.');
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleSendBroadcast = async () => {
    if (!broadcastForm.title || !broadcastForm.message) return alert("Please fill both title and message fields.");
    setIsBroadcasting(true);
    try {
      const res = await fetch(buildApiUrl('/api/admin/announcements'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastForm)
      });
      if (res.ok) {
        alert('Broadcast sent! Every user has received this announcement in their messages.');
        setBroadcastForm({ title: '', message: '' });
        fetchData(); // Refresh recent broadcasts list
      } else {
        alert('Failed to send broadcast.');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleResolveReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to mark this report as resolved?")) return;
    try {
      const res = await fetch(buildApiUrl(`/api/admin/reports/${reportId}/resolve`), { method: 'PUT' });
      if (res.ok) {
        alert('Report resolved successfully!');
        fetchData();
      } else {
        alert('Failed to resolve report.');
      }
    } catch (err) {
      console.error('Error resolving report', err);
    }
  };

  // Filter logic for Users
  const filteredUsers = allUsers.filter(u => {
    const n = u.name || '';
    const e = u.email || '';
    return n.toLowerCase().includes(searchTerm.toLowerCase()) || e.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter logic for Skills
  const filteredSkills = allSkills.filter(s => {
    const sName = s.skillName || s.skill || '';
    const pName = s.providerName || s.name || 'Community';
    return sName.toLowerCase().includes(searchTerm.toLowerCase()) || pName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter logic for Teachers
  const filteredTeachers = allTeachers.filter(t => {
    const n = t.name || '';
    const e = t.email || '';
    return n.toLowerCase().includes(searchTerm.toLowerCase()) || e.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // --- Page Components ---

  const renderDashboardOverview = () => {
    const skillCategoryData = [
      { label: 'Development', percentage: 45, color: '#646cff' },
      { label: 'Design', percentage: 25, color: '#10b981' },
      { label: 'Music', percentage: 15, color: '#f59e0b' },
      { label: 'Lifestyle', percentage: 10, color: '#ef4444' },
      { label: 'Other', percentage: 5, color: '#6b7280' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeInUp 0.5s ease' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          <StatCard title="Total Users" value={stats.totalUsers || 0} icon="👥" color="#646cff" />
          <StatCard title="Active Teachers" value={stats.totalTeacherAdmins || 0} icon="🎓" color="#34d399" />
          <StatCard title="Total Skills" value={stats.totalSkills || 0} icon="⚡" color="#f59e0b" />
          <StatCard title="Active Swaps" value={stats.activeSwaps || 0} icon="🔄" color="#10b981" />
          <StatCard title="Pending Requests" value={allSessions.filter(r => r.status === 'Pending').length} icon="🔔" color="#ef4444" />
          <StatCard title="Completed Sessions" value={allSessions.filter(r => r.status === 'Completed').length} icon="✅" color="#bc13fe" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Chart Section */}
          <div style={{
            background: '#1f2937', padding: '24px', borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex', flexDirection: 'column', height: '100%'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem', fontWeight: '600' }}>User Growth</h3>
            <SimpleLineChart data={userGrowthData} color="#646cff" />
          </div>
          <PieChart data={skillCategoryData} title="Skill Category Distribution" />
        </div>

        {/* Tables Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

          {/* Recent Users Table */}
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#e5e7eb', fontSize: '1.2rem' }}>Recent Users</h3>
              <button onClick={() => navigate('/super-admin/user-management')} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }} style={{ background: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}>View All</button>
            </div>
            {/* Table content here */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.slice(0, 5).map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '12px' }}>{user.name}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>{user.role || 'User'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Swap Requests Table */}
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem' }}>Recent Swap Requests</h3>
            {/* Table content here */}
          </div>

          {/* Teacher Management Table */}
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem' }}>Top Teachers</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
                  <th style={{ padding: '12px' }}>Learner</th>
                  <th style={{ padding: '12px' }}>Mentor</th>
                  <th style={{ padding: '12px' }}>Skill</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allSessions.slice(0, 5).map(session => (
                  <tr key={session._id} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '12px' }}>{session.learnerName}</td>
                    <td style={{ padding: '12px' }}>{session.mentorName}</td>
                    <td style={{ padding: '12px' }}>{session.skill}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', background: session.status === 'Completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: session.status === 'Completed' ? '#10b981' : '#f59e0b' }}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reviews Table */}
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem' }}>Recent Reviews</h3>
            {allRatings.slice(0, 5).map(r => (
              <div key={r._id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #374151' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#fff' }}>{r.teacherName} <span style={{ color: '#9ca3af', fontWeight: 'normal', fontSize: '0.85rem' }}>({r.skillTaught})</span></strong>
                  <span style={{ color: '#fbbf24' }}>{'★'.repeat(r.rating)}</span>
                </div>
                <p style={{ margin: '5px 0 0 0', color: '#d1d5db', fontSize: '0.9rem', fontStyle: 'italic' }}>"{r.complaint || 'No comment provided.'}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUserManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e5e7eb', margin: 0 }}>User Management</h2>
        <button onClick={() => setShowUserModal(true)} style={{ padding: '8px 16px', background: '#646cff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#535bf2'} onMouseLeave={e => e.currentTarget.style.background = '#646cff'}>+ Add User</button>
      </div>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>Name</th>
              <th style={{ padding: '16px' }}>Email</th>
              <th style={{ padding: '16px' }}>Role</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #374151', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                <td style={{ padding: '16px' }}>{u.name}</td>
                <td style={{ padding: '16px' }}>{u.email}</td>
                <td style={{ padding: '16px' }}>{u.role || 'User'}</td>
                <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '4px', fontSize: '0.8rem' }}>Active</span></td>
                <td style={{ padding: '16px' }}>
                  <button style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleRemoveUser(u._id)}>Remove</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No users found matching your search.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeacherManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e5e7eb', margin: 0 }}>Teacher Management</h2>
        <button onClick={() => setShowTeacherModal(true)} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Teacher Admin</button>
      </div>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>Teacher Name</th>
              <th style={{ padding: '16px' }}>Email</th>
              <th style={{ padding: '16px' }}>Approved Skills</th>
              <th style={{ padding: '16px' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((t, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '16px' }}>{t.name}</td>
                <td style={{ padding: '16px' }}>{t.email}</td>
                <td style={{ padding: '16px' }}>{t.skillsOffered?.length || 0}</td>
                <td style={{ padding: '16px', color: '#fbbf24', fontWeight: 'bold' }}>★ {typeof t.rating === 'number' ? t.rating.toFixed(1) : (t.rating || '4.8')}</td>
              </tr>
            ))}
            {filteredTeachers.length === 0 && <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No teachers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSkillManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e5e7eb', margin: 0 }}>Skill Management</h2>
        <button onClick={() => setShowSkillModal(true)} style={{ padding: '8px 16px', background: '#646cff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Global Skill</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredSkills.map((s, i) => (
          <div key={i} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.1rem' }}>{s.skillName || s.skill}</h3>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Provider: {s.providerName || s.name || 'Community'}</p>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '4px 10px', background: 'rgba(100,108,255,0.15)', color: '#646cff', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Active</span>
              <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>Delete</button>
            </div>
          </div>
        ))}
        {filteredSkills.length === 0 && <p style={{ color: '#9ca3af', gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>No skills match your criteria.</p>}
      </div>
    </div>
  );

  const renderVerifierApplicationsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Verifier Applications</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Verifier Requests" value={verifierApps.length} icon="🛡️" color="#10b981" />
        <StatCard title="Skill Approval Requests" value={skillApprovalRequests.length} icon="🎥" color="#f59e0b" />
      </div>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>Applicant</th>
              <th style={{ padding: '16px' }}>Category</th>
              <th style={{ padding: '16px' }}>Experience</th>
              <th style={{ padding: '16px' }}>Skills</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {verifierApps.map(app => (
              <tr key={app._id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '16px' }}>
                  <strong style={{ display: 'block', color: '#fff' }}>{app.name || 'N/A'}</strong>
                  <small style={{ color: '#9ca3af' }}>{app.email}</small>
                </td>
                <td style={{ padding: '16px' }}>{app.category}</td>
                <td style={{ padding: '16px' }}>{app.experience} Years</td>
                <td style={{ padding: '16px' }}>{app.skillsToModerate?.join(', ') || 'N/A'}</td>
                <td style={{ padding: '16px' }}>
                  <button onClick={() => handleReviewVerifierApp(app)} style={{ background: 'rgba(100,108,255,0.1)', color: '#646cff', border: '1px solid rgba(100,108,255,0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Review</button>
                </td>
              </tr>
            ))}
            {verifierApps.length === 0 && <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No pending applications found.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 style={{ color: '#e5e7eb', margin: '2rem 0 1.5rem' }}>Teacher Skill Approval Requests</h2>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>Teacher</th>
              <th style={{ padding: '16px' }}>Skill</th>
              <th style={{ padding: '16px' }}>Review Status</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {skillApprovalRequests.map((request) => (
              <tr key={request.requestId} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '16px' }}>
                  <strong style={{ display: 'block', color: '#fff' }}>{request.providerName}</strong>
                  <small style={{ color: '#9ca3af' }}>{request.providerEmail}</small>
                </td>
                <td style={{ padding: '16px' }}>{request.skillName}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 10px', background: request.reviewSession?.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: request.reviewSession?.status === 'Active' ? '#10b981' : '#f59e0b', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700' }}>
                    {request.reviewSession?.status || 'Pending Review'}
                  </span>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '6px' }}>
                    {request.reviewSession?.date ? `${request.reviewSession.date} • ${request.reviewSession.time}` : 'Not scheduled yet'}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleReviewSkillApproval(request)} style={{ background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.35)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Manage</button>
                    <button onClick={() => handleStartSkillReview(request, true)} style={{ background: 'rgba(16,185,129,0.14)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.35)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Open Room</button>
                  </div>
                </td>
              </tr>
            ))}
            {skillApprovalRequests.length === 0 && <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No skill approval requests found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSwapRequestsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Active Swap Requests</h2>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>User A (Learner)</th>
              <th style={{ padding: '16px' }}>User B (Mentor)</th>
              <th style={{ padding: '16px' }}>Target Skill</th>
              <th style={{ padding: '16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {allSessions.map((r, i) => (
              <tr key={r._id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '16px' }}>{r.learnerName}</td>
                <td style={{ padding: '16px' }}>{r.mentorName}</td>
                <td style={{ padding: '16px', fontWeight: '500' }}>{r.skill}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', background: ['Pending', 'Scheduled'].includes(r.status) ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: ['Pending', 'Scheduled'].includes(r.status) ? '#f59e0b' : '#10b981', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSessionsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Sessions / Meetings</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {allSessions.length === 0 ? <p style={{ color: '#aaa' }}>No sessions found.</p> : allSessions.map((s, i) => (
          <div key={s._id} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(100,108,255,0.1)', color: '#646cff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📅</div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1.1rem' }}>{s.skill}</h4>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Mentor: {s.mentorName} | Learner: {s.learnerName}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px 0', color: '#e5e7eb', fontWeight: '600' }}>{s.date} • {s.time}</p>
              <span style={{ color: s.status === 'Completed' ? '#10b981' : '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold' }}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreditManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Credit Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Credits Issued" value={12540} icon="💰" color="#f59e0b" />
        <StatCard title="Credits Used Today" value={342} icon="📉" color="#ef4444" />
        <StatCard title="New Credits Earned" value={350} icon="📈" color="#10b981" />
      </div>
      <div style={{ background: '#1f2937', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Recent System Transactions</h3>
        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Detailed transaction logs sync is currently in progress...</p>
      </div>
    </div>
  );

  const renderSupportTicketsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Support Tickets</h2>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>Ticket ID</th>
              <th style={{ padding: '16px' }}>User</th>
              <th style={{ padding: '16px' }}>Subject</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {allTickets.length === 0 ? <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No tickets raised yet.</td></tr> : allTickets.map((ticket, i) => (
              <tr key={ticket._id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '16px', fontWeight: '500', color: '#646cff' }}>{ticket._id.substring(ticket._id.length - 6)}</td>
                <td style={{ padding: '16px' }}>{ticket.user}</td>
                <td style={{ padding: '16px' }}>{ticket.subject}</td>
                <td style={{ padding: '16px' }}><span style={{ color: ticket.status === 'Urgent' ? '#ef4444' : (ticket.status === 'Pending' ? '#f59e0b' : '#10b981'), fontWeight: 'bold' }}>{ticket.status}</span></td>
                <td style={{ padding: '16px' }}><button onClick={() => handleViewTicket(ticket)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDisputesPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Disputes & Teacher Escalations</h2>
      {allAdminReports.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem', opacity: 0.8 }}>⚖️</div>
          <h2 style={{ color: '#10b981', margin: '0 0 10px 0' }}>No Active Disputes</h2>
          <p style={{ color: '#9ca3af', maxWidth: '400px', textAlign: 'center' }}>Great job! The community is running smoothly and there are no reported conflicts.</p>
        </div>
      ) : (
        <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
                <th style={{ padding: '16px' }}>Reported User</th>
                <th style={{ padding: '16px' }}>Reason</th>
                <th style={{ padding: '16px' }}>Details / Complaint</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {allAdminReports.map(report => (
                <tr key={report._id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: '16px' }}>
                    <strong style={{ color: '#fff', display: 'block' }}>{report.targetUserName}</strong>
                    <small style={{ color: '#9ca3af' }}>{report.targetUserEmail}</small>
                  </td>
                  <td style={{ padding: '16px', color: '#f59e0b' }}>{report.reason}</td>
                  <td style={{ padding: '16px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={report.complaint}>{report.complaint || 'No details provided.'}</td>
                  <td style={{ padding: '16px' }}><span style={{ padding: '4px 10px', background: report.status === 'Resolved' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: report.status === 'Resolved' ? '#10b981' : '#ef4444', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{report.status}</span></td>
                  <td style={{ padding: '16px' }}>
                    {report.status !== 'Resolved' && <button onClick={() => handleResolveReport(report._id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Mark Resolved</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContentManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Content Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {contents.map((item, i) => (
          <div key={i} style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem', display: 'block' }}>{item.title}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Last updated: {item.lastUpdated}</span>
            </div>
            <button onClick={() => setEditingContent(item)} style={{ background: 'rgba(100,108,255,0.15)', color: '#646cff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
          </div>
        ))}
      </div>

      {editingContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #374151', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Editing: {editingContent.title}</h3>
              <button onClick={() => setEditingContent(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
            </div>
            <textarea
              value={editingContent.text}
              onChange={e => setEditingContent({ ...editingContent, text: e.target.value })}
              style={{ flex: 1, minHeight: '300px', padding: '15px', borderRadius: '8px', border: '1px solid #4b5563', background: '#111827', color: '#d1d5db', fontFamily: 'monospace', fontSize: '0.95rem', resize: 'vertical', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #374151', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <button onClick={() => setEditingContent(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveContent} style={{ padding: '10px 20px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnnouncementsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Platform Announcements</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Create New Broadcast</h3>
          <input type="text" placeholder="Announcement Title" value={broadcastForm.title} onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff' }} />
          <textarea placeholder="Message body..." rows="5" value={broadcastForm.message} onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff', resize: 'vertical' }}></textarea>
          <button onClick={handleSendBroadcast} disabled={isBroadcasting} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: isBroadcasting ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>{isBroadcasting ? 'Sending...' : 'Publish Now'}</button>
        </div>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Recent Broadcasts</h3>
          {allAnnouncements.length === 0 ? <p style={{ color: '#aaa' }}>No broadcasts sent yet.</p> : allAnnouncements.map((a, i) => (
            <div key={a._id || i} style={{ padding: '20px', borderLeft: '4px solid #646cff', background: 'rgba(100,108,255,0.05)', marginBottom: '15px', borderRadius: '0 8px 8px 0' }}>
              <strong style={{ color: '#fff', display: 'block', fontSize: '1.1rem', marginBottom: '5px' }}>{a.title}</strong>
              <p style={{ color: '#d1d5db', margin: '0 0 10px 0', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{a.message}</p>
              <small style={{ color: '#9ca3af', fontWeight: 'bold' }}>Published on: {new Date(a.date).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Reports & Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#fff', margin: '0 0 1.5rem 0' }}>Monthly Engagement</h3>
          <SimpleLineChart data={[20, 30, 45, 60, 55, 80, 95]} color="#10b981" />
        </div>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#fff', margin: '0 0 1.5rem 0' }}>Signups vs Churn</h3>
          <SimpleLineChart data={[90, 85, 80, 85, 90, 95, 100]} color="#bc13fe" />
        </div>
      </div>
    </div>
  );

  const renderSettingsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease', paddingBottom: '2rem' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Settings & Configurations</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Admin Profile Settings */}
        <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Admin Profile</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: adminAvatar ? `url(${adminAvatar}) center/cover` : 'linear-gradient(135deg, #646cff, #bc13fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
              {!adminAvatar && (adminProfileForm.name ? adminProfileForm.name.charAt(0).toUpperCase() : 'A')}
            </div>
            <input type="file" id="avatarUpload" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <label htmlFor="avatarUpload" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s', display: 'inline-block' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>Change Avatar</label>
          </div>
          <form onSubmit={handleUpdateAdminProfile}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Full Name</label>
              <input type="text" value={adminProfileForm.name} onChange={e => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
              <input type="email" value={adminProfileForm.email} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#9ca3af', outline: 'none', cursor: 'not-allowed' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>New Password</label>
              <input type="password" placeholder="Leave blank to keep current" value={adminProfileForm.password} onChange={e => setAdminProfileForm({ ...adminProfileForm, password: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
            </div>
            <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Update Profile</button>
          </form>
        </div>

        {/* Platform Configuration */}
        <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Platform Configuration</h3>
          <form onSubmit={handleSaveConfig}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Platform Title</label>
              <input type="text" value={platformConfig.title} onChange={e => setPlatformConfig({ ...platformConfig, title: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Global Support Email</label>
              <input type="email" value={platformConfig.supportEmail} onChange={e => setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Default New User Credits</label>
              <input type="number" value={platformConfig.defaultCredits} onChange={e => setPlatformConfig({ ...platformConfig, defaultCredits: parseInt(e.target.value) || 0 })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px' }}>
                <input type="checkbox" id="reg" checked={platformConfig.allowReg} onChange={e => setPlatformConfig({ ...platformConfig, allowReg: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label htmlFor="reg" style={{ color: '#e5e7eb', cursor: 'pointer', fontSize: '0.9rem' }}>Allow New User Registrations</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <input type="checkbox" id="maint" checked={platformConfig.maintenance} onChange={e => setPlatformConfig({ ...platformConfig, maintenance: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label htmlFor="maint" style={{ color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>Enable Maintenance Mode (Blocks Login)</label>
              </div>
            </div>
            <button type="submit" style={{ background: 'linear-gradient(135deg, #646cff, #bc13fe)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>Save Configuration</button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderFeedbackPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>User Feedback & Reviews</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {allRatings.length === 0 ? <p style={{ color: '#aaa' }}>No reviews yet.</p> : allRatings.map((r) => (
          <div key={r._id} style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <strong style={{ color: '#fff', display: 'block', fontSize: '1.1rem' }}>{r.submittedByEmail}</strong>
                <small style={{ color: '#9ca3af' }}>Reviewed: {r.teacher}</small>
              </div>
              <span style={{ color: '#fbbf24', fontSize: '1.2rem', letterSpacing: '2px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p style={{ color: '#d1d5db', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>"{r.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSystemLogsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e5e7eb', margin: 0 }}>System Activity Logs</h2>
        <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Export Logs</button>
      </div>
      <div style={{ background: '#0a0f18', padding: '24px', borderRadius: '12px', fontFamily: "'Fira Code', monospace", color: '#10b981', height: '60vh', overflowY: 'auto', border: '1px solid #1f2937', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
        {allLogs.length === 0 ? <p style={{ margin: '5px 0', opacity: 0.5 }}>Waiting for new logs...</p> : allLogs.map(log => (
          <p key={log._id} style={{ margin: '5px 0', color: log.level === 'ERROR' ? '#ef4444' : (log.level === 'WARN' ? '#f59e0b' : '#10b981') }}>
            [{log.level}] {new Date(log.timestamp).toLocaleString()} - {log.message}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
      .admin-sidebar::-webkit-scrollbar { width: 6px; }
      .admin-sidebar::-webkit-scrollbar-track { background: transparent; }
      .admin-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      .admin-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      .admin-hover-trigger { position: relative; }
      .admin-hover-dropdown {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(8px);
        transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
      }
      .admin-hover-trigger:hover .admin-hover-dropdown {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0);
      }
    `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#111827', fontFamily: "'Inter', sans-serif" }}>

        {/* --- Left Sidebar --- */}
        <div className="admin-sidebar" style={{
          width: '260px', background: '#1f2937', borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', position: 'fixed', height: '100%', zIndex: 10,
          overflowY: 'auto'
        }}>
          <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <img src="/vite.svg" alt="Logo" width="32" />
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>SkillSwap<span style={{ color: '#646cff' }}>.Admin</span></span>
          </div>

          <div style={{ flex: 1, padding: '10px 0 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ padding: '0 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Admin Navigation</p>

            <SidebarSection
              title="Core Management"
              icon={<AdminIcon name="dashboard" />}
              isOpen={openSidebarSection === 'core'}
              active={getSidebarSectionForPath(location.pathname) === 'core'}
              onToggle={() => setOpenSidebarSection(prev => prev === 'core' ? '' : 'core')}
            >
              <SidebarItem to="/super-admin/overview" label="Dashboard" icon={<AdminIcon name="dashboard" />} active={location.pathname.includes('/overview') || location.pathname === '/super-admin' || location.pathname === '/super-admin/'} />
              <SidebarItem to="/super-admin/user-management" label="User Management" icon={<AdminIcon name="users" />} active={location.pathname.includes('/user-management')} />
              <SidebarItem to="/super-admin/teacher-management" label="Teacher Management" icon={<AdminIcon name="graduation" />} active={location.pathname.includes('/teacher-management')} />
              <SidebarItem to="/super-admin/verifier-apps" label="Verifier Applications" icon={<AdminIcon name="clipboard" />} active={location.pathname.includes('/verifier-apps')} badgeCount={verifierApps.length} />
              <SidebarItem to="/super-admin/skill-management" label="Skill Management" icon={<AdminIcon name="spark" />} active={location.pathname.includes('/skill-management')} />
              <SidebarItem to="/super-admin/swap-requests" label="Swap Requests" icon={<AdminIcon name="swap" />} active={location.pathname.includes('/swap-requests')} badgeCount={allSessions.filter(r => r.status === 'Pending').length} />
              <SidebarItem to="/super-admin/sessions" label="Sessions / Meetings" icon={<AdminIcon name="calendar" />} active={location.pathname.includes('/sessions')} />
            </SidebarSection>

            <SidebarSection
              title="Finance & Support"
              icon={<AdminIcon name="wallet" />}
              isOpen={openSidebarSection === 'finance'}
              active={getSidebarSectionForPath(location.pathname) === 'finance'}
              onToggle={() => setOpenSidebarSection(prev => prev === 'finance' ? '' : 'finance')}
            >
              <SidebarItem to="/super-admin/credits" label="Credit Management" icon={<AdminIcon name="wallet" />} active={location.pathname.includes('/credits')} />
              <SidebarItem to="/super-admin/support" label="Support Tickets" icon={<AdminIcon name="ticket" />} active={location.pathname.includes('/support')} badgeCount={allTickets.filter(t => t.status === 'Pending').length} />
              <SidebarItem to="/super-admin/disputes" label="Disputes Handling" icon={<AdminIcon name="scale" />} active={location.pathname.includes('/disputes')} badgeCount={allAdminReports.filter(r => r.status !== 'Resolved').length} />
            </SidebarSection>

            <SidebarSection
              title="Content & Marketing"
              icon={<AdminIcon name="megaphone" />}
              isOpen={openSidebarSection === 'content'}
              active={getSidebarSectionForPath(location.pathname) === 'content'}
              onToggle={() => setOpenSidebarSection(prev => prev === 'content' ? '' : 'content')}
            >
              <SidebarItem to="/super-admin/content" label="Content Management" icon={<AdminIcon name="content" />} active={location.pathname.includes('/content')} />
              <SidebarItem to="/super-admin/announcements" label="Announcements" icon={<AdminIcon name="megaphone" />} active={location.pathname.includes('/announcements')} />
            </SidebarSection>

            <SidebarSection
              title="System & Config"
              icon={<AdminIcon name="settings" />}
              isOpen={openSidebarSection === 'system'}
              active={getSidebarSectionForPath(location.pathname) === 'system'}
              onToggle={() => setOpenSidebarSection(prev => prev === 'system' ? '' : 'system')}
            >
              <SidebarItem to="/super-admin/reports" label="Reports & Analytics" icon={<AdminIcon name="analytics" />} active={location.pathname.includes('/reports')} />
              <SidebarItem to="/super-admin/settings" label="Platform Settings" icon={<AdminIcon name="settings" />} active={location.pathname.includes('/settings')} />
              <SidebarItem to="/super-admin/feedback" label="Feedback & Reviews" icon={<AdminIcon name="star" />} active={location.pathname.includes('/feedback')} />
              <SidebarItem to="/super-admin/logs" label="System Logs" icon={<AdminIcon name="logs" />} active={location.pathname.includes('/logs')} />
            </SidebarSection>
          </div>

          <div style={{ padding: '20px', flexShrink: 0 }}>
            <button
              onClick={handleLogout}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              style={{
                width: '100%', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s ease'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>

          {/* Top Navbar */}
          <div style={{
            height: '70px', background: '#1f2937', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', position: 'sticky', top: 0, zIndex: 5
          }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '300px' }}>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = '#646cff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(100,108,255,0.2)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                style={{
                  width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '10px 16px 10px 40px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s ease'
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ThemeToggle />
              <div className="admin-hover-trigger" title="Notifications" onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'} style={{ position: 'relative', cursor: 'pointer', color: '#9ca3af', transition: 'color 0.2s ease' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
                <NotificationsDropdown />
              </div>
              <div className="admin-hover-trigger" title="Messages" onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'} style={{ position: 'relative', cursor: 'pointer', color: '#9ca3af', transition: 'color 0.2s ease' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <MessagesDropdown />
              </div>
              <div className="admin-hover-trigger" onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #374151', paddingLeft: '20px', cursor: 'pointer', transition: 'opacity 0.2s ease' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>{adminProfileForm.name || 'Admin'}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>Super Admin</p>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: adminAvatar ? `url(${adminAvatar}) center/cover` : 'linear-gradient(135deg, #646cff, #bc13fe)', border: '2px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                  {!adminAvatar && (adminProfileForm.name ? adminProfileForm.name.substring(0, 2).toUpperCase() : 'A')}
                </div>
                <ProfileDropdown onLogout={handleLogout} />
              </div>
            </div>
          </div>

          {/* Dashboard Content Container */}
          <div style={{ padding: '30px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={renderDashboardOverview()} />
              <Route path="user-management" element={renderUserManagementPage()} />
              <Route path="verifier-apps" element={renderVerifierApplicationsPage()} />
              <Route path="teacher-management" element={renderTeacherManagementPage()} />
              <Route path="skill-management" element={renderSkillManagementPage()} />
              <Route path="swap-requests" element={renderSwapRequestsPage()} />
              <Route path="sessions" element={renderSessionsPage()} />
              <Route path="reports" element={renderReportsPage()} />
              <Route path="settings" element={renderSettingsPage()} />
              <Route path="feedback" element={renderFeedbackPage()} />
              <Route path="logs" element={renderSystemLogsPage()} />
              <Route path="credits" element={renderCreditManagementPage()} />
              <Route path="support" element={renderSupportTicketsPage()} />
              <Route path="disputes" element={renderDisputesPage()} />
              <Route path="content" element={renderContentManagementPage()} />
              <Route path="announcements" element={renderAnnouncementsPage()} />
            </Routes>
          </div>

        </div>

        {/* Add Teacher Admin Modal */}
        {showTeacherModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Register Teacher Admin</h3>
              <form onSubmit={handleRegisterTeacher}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Full Name</label>
                  <input type="text" value={teacherForm.name} onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Email Address</label>
                  <input type="email" value={teacherForm.email} onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Password</label>
                  <input type="password" value={teacherForm.password} onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowTeacherModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 16px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Register</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Global Skill Modal */}
        {showSkillModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Add Global Skill</h3>
              <form onSubmit={handleAddGlobalSkill}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Skill Name</label>
                  <input type="text" value={skillForm.skillName} onChange={e => setSkillForm({ ...skillForm, skillName: e.target.value })} required placeholder="e.g. Advanced React" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Provider Name</label>
                  <input type="text" value={skillForm.providerName} onChange={e => setSkillForm({ ...skillForm, providerName: e.target.value })} required placeholder="e.g. System, Community" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowSkillModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 16px', background: '#646cff', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Add Skill</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showUserModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Add New User</h3>
              <form onSubmit={handleAddUser}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Full Name</label>
                  <input type="text" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Email Address</label>
                  <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Password</label>
                  <input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowUserModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 16px', background: '#646cff', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Create User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Ticket Modal */}
        {showTicketModal && selectedTicket && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '500px', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #374151', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#fff' }}>Ticket Details</h3>
                <span style={{ padding: '4px 10px', background: selectedTicket.status === 'Urgent' ? 'rgba(239,68,68,0.2)' : (selectedTicket.status === 'Pending' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'), color: selectedTicket.status === 'Urgent' ? '#ef4444' : (selectedTicket.status === 'Pending' ? '#f59e0b' : '#10b981'), borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedTicket.status}</span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Ticket ID & Date</p>
                <p style={{ margin: 0, color: '#e5e7eb', fontWeight: '500' }}>{selectedTicket.id} • {selectedTicket.date}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Reported By</p>
                <p style={{ margin: 0, color: '#e5e7eb', fontWeight: '500' }}>{selectedTicket.user}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Subject</p>
                <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{selectedTicket.subject}</p>
              </div>
              <div style={{ marginBottom: '2rem', background: '#111827', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Description</p>
                <p style={{ margin: 0, color: '#d1d5db', lineHeight: '1.5', fontSize: '0.95rem' }}>{selectedTicket.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowTicketModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                {selectedTicket.status !== 'Resolved' && <button onClick={() => { alert('Marked as resolved!'); setShowTicketModal(false); }} style={{ padding: '10px 20px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Mark as Resolved</button>}
              </div>
            </div>
          </div>
        )}

        {/* View Verifier Application Modal */}
        {showVerifierModal && selectedVerifierApp && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #374151', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#fff' }}>Review Verifier Application</h3>
                <button onClick={() => setShowVerifierModal(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Applicant Information</p>
                <p style={{ margin: 0, color: '#e5e7eb', fontWeight: '500', fontSize: '1.1rem' }}>{selectedVerifierApp.name}</p>
                <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.95rem' }}>{selectedVerifierApp.email}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Category</p>
                  <p style={{ margin: 0, color: '#e5e7eb', fontWeight: '500' }}>{selectedVerifierApp.category}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Experience</p>
                  <p style={{ margin: 0, color: '#e5e7eb', fontWeight: '500' }}>{selectedVerifierApp.experience} Years</p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Skills to Moderate</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedVerifierApp.skillsToModerate?.map((skill, i) => (
                    <span key={i} style={{ background: 'rgba(100,108,255,0.15)', color: '#93c5fd', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>{skill}</span>
                  ))}
                  {(!selectedVerifierApp.skillsToModerate || selectedVerifierApp.skillsToModerate.length === 0) && <span style={{ color: '#9ca3af' }}>None provided</span>}
                </div>
              </div>

              {selectedVerifierApp.summary && (
                <div style={{ marginBottom: '1rem', background: '#111827', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Summary / Bio</p>
                  <p style={{ margin: 0, color: '#d1d5db', lineHeight: '1.5', fontSize: '0.95rem' }}>{selectedVerifierApp.summary}</p>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {selectedVerifierApp.linkedinUrl && (
                  <a href={selectedVerifierApp.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#0a66c2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                      LinkedIn Profile ↗
                    </button>
                  </a>
                )}
                {selectedVerifierApp.resumeUrl && selectedVerifierApp.resumeUrl !== 'No file uploaded' && (
                  <button onClick={() => setShowDocumentPreview(!showDocumentPreview)} style={{ background: showDocumentPreview ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)', color: showDocumentPreview ? '#10b981' : '#fff', border: `1px solid ${showDocumentPreview ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.2)'}`, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s' }}>
                    {showDocumentPreview ? 'Hide Document 📄' : 'View Proof Document 📄'}
                  </button>
                )}
              </div>

              {showDocumentPreview && selectedVerifierApp.resumeUrl && (
                <div style={{ marginBottom: '1.5rem', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #374151', background: '#fff' }}>
                  <iframe
                    src={buildApiUrl(`/uploads/${selectedVerifierApp.resumeUrl.split(/[/\\]/).pop()}`)}
                    title="Proof Document"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.5rem', padding: '15px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isVerifierProofChecked} onChange={(e) => setIsVerifierProofChecked(e.target.checked)} style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }} />
                  <span style={{ color: '#fbbf24', fontSize: '0.95rem', lineHeight: '1.4' }}>I confirm that I have reviewed the applicant's details, verified their proofs, and consider them eligible for the Teacher Admin role.</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #374151', paddingTop: '1.5rem' }}>
                <button onClick={() => setShowVerifierModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => handleApproveRejectApp(selectedVerifierApp._id, 'Rejected')} style={{ padding: '10px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Reject Application</button>
                <button
                  onClick={() => handleApproveRejectApp(selectedVerifierApp._id, 'Approved')}
                  disabled={!isVerifierProofChecked}
                  title={!isVerifierProofChecked ? 'Please verify proofs first' : ''}
                  style={{
                    padding: '10px 20px',
                    background: isVerifierProofChecked ? '#10b981' : '#374151',
                    border: 'none',
                    color: isVerifierProofChecked ? '#fff' : '#9ca3af',
                    borderRadius: '6px',
                    cursor: isVerifierProofChecked ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}>
                  Verify & Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {showSkillApprovalModal && selectedSkillApproval && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '620px', maxWidth: '92vw', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #374151', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fff' }}>Manage Skill Approval</h3>
                  <p style={{ margin: '6px 0 0 0', color: '#9ca3af', fontSize: '0.9rem' }}>{selectedSkillApproval.providerName} • {selectedSkillApproval.skillName}</p>
                </div>
                <button onClick={() => setShowSkillApprovalModal(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ background: '#111827', padding: '14px', borderRadius: '10px', border: '1px solid #374151' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.82rem' }}>Teacher Email</p>
                  <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{selectedSkillApproval.providerEmail}</p>
                </div>
                <div style={{ background: '#111827', padding: '14px', borderRadius: '10px', border: '1px solid #374151' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.82rem' }}>Current Review Status</p>
                  <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{selectedSkillApproval.reviewSession?.status || 'Pending Review'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Schedule Date</label>
                  <input type="date" value={skillReviewSchedule.date} onChange={(e) => setSkillReviewSchedule((prev) => ({ ...prev, date: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#111827', border: '1px solid #374151', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Schedule Time</label>
                  <input type="text" value={skillReviewSchedule.time} onChange={(e) => setSkillReviewSchedule((prev) => ({ ...prev, time: e.target.value }))} placeholder="06:00 PM" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#111827', border: '1px solid #374151', color: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <button onClick={handleScheduleSkillReview} style={{ padding: '10px 16px', background: '#2563eb', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Schedule Review</button>
                <button onClick={() => handleStartSkillReview(selectedSkillApproval)} style={{ padding: '10px 16px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Start Video Interaction</button>
                <button onClick={() => handleStartSkillReview(selectedSkillApproval, true)} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid #374151', color: '#d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Start & Open Review Room</button>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #374151', paddingTop: '1.5rem' }}>
                <button onClick={() => setShowSkillApprovalModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                <button onClick={() => handleSkillApprovalDecision('Rejected')} style={{ padding: '10px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                <button onClick={() => handleSkillApprovalDecision('Approved')} style={{ padding: '10px 20px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SuperAdmin;
