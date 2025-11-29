import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  Settings,
  Trash2,
  Clock,
  Users,
  Zap,
  Archive,
  VolumeX,
  Volume2,
  Filter
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: 'system' | 'collaboration' | 'execution' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actor?: {
    name: string;
    avatar: string;
  };
}

// 3D Card hover effect - reusable
const use3DCardEffect = () => ({
  style: { 
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    willChange: 'transform'
  } as React.CSSProperties,
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    const tiltX = deltaY * -5;
    const tiltY = deltaX * 5;
    e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale(1.02)`;
    e.currentTarget.style.boxShadow = '0 20px 40px rgba(34, 197, 220, 0.15)';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    e.currentTarget.style.boxShadow = 'none';
  }
});

const NotificationsCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      category: 'execution',
      title: 'Flow Completed Successfully',
      message: 'Research Workflow finished with 5 tasks completed in 12m 34s',
      timestamp: '2 min ago',
      read: false,
      actionUrl: '/flows/research-workflow',
      actionLabel: 'View Results'
    },
    {
      id: '2',
      type: 'info',
      category: 'collaboration',
      title: 'New Team Member',
      message: 'Ana Petrovic has joined your workspace as Editor',
      timestamp: '15 min ago',
      read: false,
      actor: { name: 'Ana Petrovic', avatar: 'AP' }
    },
    {
      id: '3',
      type: 'warning',
      category: 'alert',
      title: 'API Rate Limit Warning',
      message: 'You have used 85% of your daily API quota. Consider upgrading your plan.',
      timestamp: '1 hour ago',
      read: false,
      actionUrl: '/settings/billing',
      actionLabel: 'Upgrade Plan'
    },
    {
      id: '4',
      type: 'error',
      category: 'execution',
      title: 'Task Failed',
      message: 'Data Analysis task failed due to connection timeout. Retry recommended.',
      timestamp: '2 hours ago',
      read: true,
      actionUrl: '/tasks/data-analysis',
      actionLabel: 'Retry Task'
    },
    {
      id: '5',
      type: 'info',
      category: 'system',
      title: 'New Feature Available',
      message: 'Templates Library is now available! Create workflows faster with pre-built templates.',
      timestamp: '5 hours ago',
      read: true,
      actionUrl: '/templates',
      actionLabel: 'Explore Templates'
    },
    {
      id: '6',
      type: 'success',
      category: 'collaboration',
      title: 'Comment Received',
      message: 'Marko left a comment on Marketing Agent: "Great configuration!"',
      timestamp: '1 day ago',
      read: true,
      actor: { name: 'Marko Jovanovic', avatar: 'MJ' }
    },
    {
      id: '7',
      type: 'info',
      category: 'system',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for Sunday 3:00 AM - 5:00 AM UTC',
      timestamp: '2 days ago',
      read: true
    },
    {
      id: '8',
      type: 'success',
      category: 'execution',
      title: 'Batch Execution Complete',
      message: '10 flows completed successfully. View the summary report.',
      timestamp: '3 days ago',
      read: true,
      actionUrl: '/reports/batch-summary',
      actionLabel: 'View Report'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'collaboration' | 'execution' | 'alert'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    executionAlerts: true,
    collaborationAlerts: true,
    systemAlerts: true,
    marketingEmails: false
  });

  const cardEffect = use3DCardEffect();

  const getTypeIcon = (type: Notification['type']) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-emerald-400`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-400`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-400`} />;
      case 'info':
        return <Info className={`${iconClass} text-cyan-400`} />;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'collaboration':
        return <Users className="w-4 h-4" />;
      case 'execution':
        return <Zap className="w-4 h-4" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeBgClass = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'info': return 'bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllRead = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Bell size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" strokeWidth={1.5} />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-slate-400 font-mono">workspace.notifications</p>
          </div>
        </div>
        <p className="text-slate-500 mt-2">
          {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(34,197,220,0.2)]"
        >
          <CheckCheck size={16} />
          Mark All Read
        </button>
        <button
          onClick={clearAllRead}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#080F1A] hover:bg-slate-800 text-slate-400 border border-cyan-500/20 rounded-lg transition-all duration-200 text-sm"
        >
          <Archive size={16} />
          Clear Read
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2.5 rounded-lg border transition-all duration-200 ${
            showSettings 
              ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' 
              : 'bg-[#080F1A] border-cyan-500/20 text-slate-400 hover:text-white'
          }`}
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 bg-[#080F1A]/60 backdrop-blur-sm p-2 rounded-xl border border-cyan-500/10 overflow-x-auto">
            {[
              { key: 'all', label: 'All', icon: Bell },
              { key: 'unread', label: 'Unread', icon: Clock },
              { key: 'execution', label: 'Execution', icon: Zap },
              { key: 'collaboration', label: 'Team', icon: Users },
              { key: 'system', label: 'System', icon: Settings },
              { key: 'alert', label: 'Alerts', icon: AlertTriangle }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-sm ${
                  filter === tab.key
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-white hover:bg-cyan-500/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'unread' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 bg-[#080F1A]/60 backdrop-blur-sm rounded-xl border border-cyan-500/10">
                <Bell className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No notifications to show</p>
                <p className="text-slate-600 text-sm mt-2">
                  {filter === 'unread' ? "You're all caught up!" : 'Check back later for updates'}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                    notification.read
                      ? 'bg-[#080F1A]/40 border-cyan-500/10'
                      : 'bg-[#080F1A]/70 border-cyan-500/30'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                  {...cardEffect}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-lg border ${getTypeBgClass(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{notification.message}</p>
                      
                      <div className="flex items-center flex-wrap gap-4">
                        <span className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500 text-xs font-mono uppercase">
                          {getCategoryIcon(notification.category)}
                          {notification.category}
                        </span>
                        {notification.actor && (
                          <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <div className="w-5 h-5 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center text-[9px] text-cyan-400 font-bold">
                              {notification.actor.avatar}
                            </div>
                            {notification.actor.name}
                          </span>
                        )}
                      </div>

                      {notification.actionUrl && (
                        <button className="mt-3 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(34,197,220,0.2)]">
                          {notification.actionLabel}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-full lg:w-80 bg-[#080F1A]/60 backdrop-blur-sm rounded-xl border border-cyan-500/10 p-6 h-fit">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Notification Settings
            </h3>

            <div className="space-y-4">
              {/* Toggle Items */}
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: null },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push alerts', icon: null },
                { key: 'soundEnabled', label: 'Sound', desc: 'Notification sounds', icon: notificationSettings.soundEnabled ? Volume2 : VolumeX },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon className={`w-4 h-4 ${notificationSettings[item.key as keyof typeof notificationSettings] ? 'text-cyan-400' : 'text-slate-500'}`} />}
                    <div>
                      <p className="text-white text-sm">{item.label}</p>
                      <p className="text-slate-600 text-xs">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notificationSettings] }))}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                      notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      notificationSettings[item.key as keyof typeof notificationSettings] ? 'left-[22px]' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}

              <div className="border-t border-cyan-500/10 my-4" />

              <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">Alert Types</p>

              {/* Alert Type Toggles */}
              {[
                { key: 'executionAlerts', label: 'Execution Alerts', icon: Zap, color: 'text-amber-400' },
                { key: 'collaborationAlerts', label: 'Collaboration', icon: Users, color: 'text-emerald-400' },
                { key: 'systemAlerts', label: 'System Updates', icon: Settings, color: 'text-cyan-400' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-white text-sm">{item.label}</span>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notificationSettings] }))}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                      notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      notificationSettings[item.key as keyof typeof notificationSettings] ? 'left-[22px]' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}

              <div className="border-t border-cyan-500/10 my-4" />

              {/* Marketing Emails */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Marketing Emails</p>
                  <p className="text-slate-600 text-xs">Product news & updates</p>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                  className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                    notificationSettings.marketingEmails ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    notificationSettings.marketingEmails ? 'left-[22px]' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-200 font-medium text-sm hover:shadow-[0_0_20px_rgba(34,197,220,0.2)]">
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsCenter;
