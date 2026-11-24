import React, { useEffect, useState } from 'react';
import { statsService } from '../../services/stats.service';
import { settingsService } from '../../services/settings.service';
import { barberService } from '../../services/barber.service';
import { queueService } from '../../services/queue.service';
import { DailyStats, Barber, SalonSettings, QueueEntry } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatDuration, formatPrice, formatTime } from '../../utils/formatters';
import { BARBER_STATUS_COLORS, BARBER_STATUS_LABELS } from '../../utils/constants';
import {
  Users,
  DollarSign,
  Clock,
  Scissors,
  Power,
  RefreshCw,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function OwnerDashboardPage() {
  const [stats, setStats] = useState<(DailyStats & { totalToday: number }) | null>(null);
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [liveQueue, setLiveQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingQueue, setTogglingQueue] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, settingsData, barbersData, queueData] = await Promise.all([
        statsService.getDaily(),
        settingsService.getSettings(),
        barberService.getAll(false),
        queueService.getLiveQueue(),
      ]);
      setStats(statsData);
      setSettings(settingsData);
      setBarbers(barbersData);
      setLiveQueue(queueData);
    } catch (err) {
      console.error('Failed to load owner overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQueue = async () => {
    if (!settings) return;
    setTogglingQueue(true);
    try {
      const updated = await settingsService.toggleQueue(!settings.isQueueOpen);
      setSettings(updated);
    } catch (err) {
      console.error('Failed to toggle queue:', err);
    } finally {
      setTogglingQueue(false);
    }
  };

  const isQueueOpen = settings?.isQueueOpen ?? true;

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {settings?.salonName || 'Elite Cuts Salon'} — Salon performance and real-time operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadDashboardData} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          {/* Queue Open/Close Toggle Button */}
          <Button
            size="sm"
            variant={isQueueOpen ? 'destructive' : 'success'}
            onClick={handleToggleQueue}
            disabled={togglingQueue}
            className="gap-2 font-semibold"
          >
            <Power className="h-4 w-4" />
            {isQueueOpen ? 'Close Queue' : 'Open Queue'}
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Served Today */}
        <Card className="p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Customers Served
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">
            {stats?.customersServed ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <span className="text-emerald-500 font-medium">
              {stats?.customersWaiting ?? 0} currently waiting
            </span>
          </div>
        </Card>

        {/* Revenue Today */}
        <Card className="p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">
            {formatPrice(stats?.totalRevenue ?? 0)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <span>Completed services total</span>
          </div>
        </Card>

        {/* Avg Wait Time */}
        <Card className="p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Wait Time
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">
            {formatDuration(stats?.averageWaitMinutes ?? 15)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <span>From token to chair</span>
          </div>
        </Card>

        {/* Queue Status */}
        <Card className="p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Salon Queue Status
            </span>
            <span
              className={`h-3 w-3 rounded-full ${
                isQueueOpen ? 'bg-success animate-pulse' : 'bg-destructive'
              }`}
            />
          </div>
          <div className="text-2xl font-extrabold text-foreground mt-2 flex items-center gap-2">
            {isQueueOpen ? (
              <span className="text-success">OPEN</span>
            ) : (
              <span className="text-destructive">CLOSED</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <span>Max capacity: {settings?.maxQueueSize || 50}</span>
          </div>
        </Card>
      </div>

      {/* Barbers Stations & Live Queue Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Barbers Workstations */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Barber Stations</CardTitle>
              <CardDescription>Current shift availability and active clients</CardDescription>
            </div>
            <Link to="/owner/barbers">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Manage <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="divide-y divide-border/60">
            {barbers.map((barber) => (
              <div key={barber.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {barber.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{barber.name}</h4>
                    <p className="text-muted-foreground">{barber.specialization || 'Stylist'}</p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    BARBER_STATUS_COLORS[barber.status]
                  }`}
                >
                  {BARBER_STATUS_LABELS[barber.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Operations & TV Link */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Access</CardTitle>
            <CardDescription>Shortcut to operational displays</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Link to="/reception" className="block">
              <Button variant="outline" className="w-full justify-start text-xs h-11 gap-2.5">
                <Users className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Reception Desk</div>
                  <div className="text-[10px] text-muted-foreground">Manage live queue calls</div>
                </div>
              </Button>
            </Link>

            <Link to="/tv" target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full justify-start text-xs h-11 gap-2.5">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <div className="text-left">
                  <div className="font-semibold">TV Waiting Screen</div>
                  <div className="text-[10px] text-muted-foreground">Launch wall dashboard</div>
                </div>
              </Button>
            </Link>

            <Link to="/owner/analytics" className="block">
              <Button variant="outline" className="w-full justify-start text-xs h-11 gap-2.5">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">Detailed Analytics</div>
                  <div className="text-[10px] text-muted-foreground">Haircut popularity & staff KPIs</div>
                </div>
              </Button>
            </Link>
          </CardContent>

          <div className="p-4 bg-muted/20 border-t text-xs text-muted-foreground text-center">
            Operating Hours: {settings?.openTime} - {settings?.closeTime}
          </div>
        </Card>
      </div>
    </div>
  );
}
