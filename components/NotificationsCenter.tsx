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
  Filter,
  Trash2,
  Clock,
  Users,
  Zap,
  MessageSquare,
  GitBranch,
  Archive,
  VolumeX,
  Volume2
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
      actor: {
        name: 'Ana Petrovic',
        avatar: 'AP'
      }
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
      actor: {
        name: 'Marko Jovanovic',
        avatar: 'MJ'
      }
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

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-cyan-400" />;
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

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
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

  const hoverEffect = {
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const deltaX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const deltaY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      e.currentTarget.style.transform = `perspective(1000px) rotateX(${deltaY * -5}deg) rotateY(${deltaX * 5}deg) translateY(-4px) scale(1.02)`;
      e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 197, 220, 0.3)';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '';
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#080F1A' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="w-10 h-10 text-cyan-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all duration-200 flex items-center gap-2"
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
          <button
            onClick={clearAllRead}
            className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            Clear Read
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 bg-gray-800/30 p-2 rounded-xl border border-gray-700/50">
            {[
              { key: 'all', label: 'All', icon: Bell },
              { key: 'unread', label: 'Unread', icon: Clock },
              { key: 'execution', label: 'Execution', icon: Zap },
              { key: 'collaboration', label: 'Collaboration', icon: Users },
              { key: 'system', label: 'System', icon: Settings },
              { key: 'alert', label: 'Alerts', icon: AlertTriangle }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'unread' && unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 bg-gray-800/20 rounded-xl border border-gray-700/30">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No notifications to show</p>
                <p className="text-gray-500 text-sm mt-2">
                  {filter === 'unread' ? "You're all caught up!" : 'Check back later for updates'}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    notification.read
                      ? 'bg-gray-800/20 border-gray-700/30'
                      : 'bg-gray-800/40 border-cyan-500/30'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => markAsRead(notification.id)}
                  {...hoverEffect}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${
                      notification.type === 'success' ? 'bg-green-500/20' :
                      notification.type === 'error' ? 'bg-red-500/20' :
                      notification.type === 'warning' ? 'bg-yellow-500/20' :
                      'bg-cyan-500/20'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                      
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                          {getCategoryIcon(notification.category)}
                          {notification.category}
                        </span>
                        {notification.actor && (
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <div className="w-4 h-4 bg-cyan-500/30 rounded-full flex items-center justify-center text-[8px] text-cyan-400">
                              {notification.actor.avatar}
                            </div>
                            {notification.actor.name}
                          </span>
                        )}
                      </div>

                      {notification.actionUrl && (
                        <button className="mt-3 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all">
                          {notification.actionLabel}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all"
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
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
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
          <div className="w-80 bg-gray-800/30 rounded-xl border border-gray-700/50 p-6 h-fit">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Notification Settings
            </h3>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Email Notifications</p>
                  <p className="text-gray-500 text-xs">Receive updates via email</p>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    notificationSettings.emailNotifications ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Push Notifications</p>
                  <p className="text-gray-500 text-xs">Browser push alerts</p>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    notificationSettings.pushNotifications ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notificationSettings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                  <div>
                    <p className="text-white text-sm">Sound</p>
                    <p className="text-gray-500 text-xs">Notification sounds</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    notificationSettings.soundEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    notificationSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="border-t border-gray-700/50 my-4" />

              <p className="text-gray-400 text-sm font-medium mb-3">Alert Types</p>

              {/* Execution Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">Execution Alerts</span>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ ...prev, executionAlerts: !prev.executionAlerts }))}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    notificationSettings.executionAlerts ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    notificationSettings.executionAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Collaboration Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm">Collaboration</span>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ ...prev, collaborationAlerts: !prev.collaborationAlerts }))}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    notificationSettings.collaborationAlerts ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    notificationSettings.collaborationAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* System Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span className="text-white text-sm">System Updates</span>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ ...prev, systemAlerts: !prev.systemAlerts }))}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    notificationSettings.systemAlerts ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    notificationSettings.systemAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="border-t border-gray-700/50 my-4" />

              {/* Marketing Emails */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Marketing Emails</p>
                  <p className="text-gray-500 text-xs">Product news & updates</p>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    notificationSettings.marketingEmails ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    notificationSettings.marketingEmails ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <button className="w-full mt-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-all duration-200 font-medium">
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsCenter;
