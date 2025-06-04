'use client';

import { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { RefreshCw, Activity } from 'lucide-react';
import { WebsiteCard } from './components/website-card';
import { AddWebsiteForm } from './components/add-website-forms';
import { useUser } from '@stackframe/stack';
import { UserMenu } from './components/user-menu';

interface Website {
  id: number;
  name: string;
  url: string;
  email: string;
  is_active: boolean;
  current_status: string;
  avg_response_time: number;
  recent_checks: Array<{
    status: string;
    response_time: number;
    checked_at: string;
  }>;
}

export default function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useUser({ or: 'redirect' });

  const fetchWebsites = useCallback(async () => {
    try {
      const response = await fetch('/api/websites');
      if (!response.ok) {
        const errText = await response.text();
        console.error('Fetch failed:', errText);
        return;
      }
      try {
        const data = await response.json();

        setWebsites(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Invalid JSON:', e);
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleManualCheck = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/check-uptime');
      if (!res.ok) {
        const errText = await res.text();
        console.error('Check failed:', errText);
        return;
      }

      // Optionally log success response
      console.log('Check complete');

      // Re-fetch website stats
      await fetchWebsites();
    } catch (error) {
      console.error('Failed to trigger uptime check:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWebsites();

    const interval = setInterval(fetchWebsites, 30000);
    return () => clearInterval(interval);
  }, [fetchWebsites]);

  const getOverallStats = () => {
    const activeWebsites = websites.filter((w) => w.is_active);
    const upWebsites = activeWebsites.filter((w) => w.current_status === 'up');

    return {
      total: activeWebsites.length,
      up: upWebsites.length,
      down: activeWebsites.length - upWebsites.length,
    };
  };

  const stats = getOverallStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Website Uptime Monitor</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleManualCheck} disabled={isRefreshing}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Check Now
            </Button>
            <UserMenu />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Total Sites</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <h3 className="font-semibold">Online</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">{stats.up}</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <h3 className="font-semibold">Offline</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">{stats.down}</p>
          </div>
        </div>

        <AddWebsiteForm onWebsiteAdded={fetchWebsites} />

        {websites.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              No websites monitored yet
            </h3>
            <p className="text-muted-foreground">
              Add your first website to start monitoring its uptime
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <WebsiteCard
                key={website.id}
                website={website}
                onUpdate={fetchWebsites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
