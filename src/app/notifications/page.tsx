'use client';
import React, { useState, useEffect } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<{id: string, title: string, message: string, is_read: boolean, created_at: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id?: string) => {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: id })
    });
    fetchNotifications();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={() => markRead()} className="text-blue-600 hover:underline text-sm font-medium">Mark all as read</button>
      </div>
      
      {loading ? <p>Loading...</p> : (
        <div className="space-y-4">
          {notifications.length === 0 ? <p className="text-gray-500">No notifications.</p> : null}
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded border ${n.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-bold ${n.is_read ? 'text-gray-700' : 'text-blue-800'}`}>{n.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
