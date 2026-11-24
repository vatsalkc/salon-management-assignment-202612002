import React, { useEffect, useState } from 'react';
import { statsService } from '../../services/stats.service';
import { BarberStats, ServiceStats, DailyStats } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatDuration, formatPrice } from '../../utils/formatters';
import { BARBER_STATUS_COLORS, BARBER_STATUS_LABELS } from '../../utils/constants';
import { Scissors, UserCheck, TrendingUp, BarChart3, Award, AlertCircle } from 'lucide-react';

export function OwnerAnalyticsPage() {
  const [dailyStats, setDailyStats] = useState<(DailyStats & { totalToday: number }) | null>(null);
  const [barberStats, setBarberStats] = useState<BarberStats[]>([]);
  const [popularServices, setPopularServices] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [daily, barbers, services] = await Promise.all([
        statsService.getDaily(),
        statsService.getBarberStats(),
        statsService.getPopularServices(),
      ]);
      setDailyStats(daily);
      setBarberStats(barbers);
      setPopularServices(services);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border/70">
        <h1 className="text-2xl font-bold tracking-tight">Salon Analytics & Reports</h1>
        <p className="text-sm text-muted-foreground">
          Historical service performance, barber metrics, and throughput trends
        </p>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-muted/20">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Today's Total Customers
          </span>
          <div className="text-2xl font-bold text-foreground mt-1">
            {dailyStats?.totalToday ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {dailyStats?.customersServed ?? 0} served • {dailyStats?.cancelledCount ?? 0} cancelled
          </p>
        </Card>

        <Card className="p-4 bg-muted/20">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            No-Show Rate
          </span>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {dailyStats?.noShowCount ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Customers missed their call
          </p>
        </Card>

        <Card className="p-4 bg-muted/20">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            Estimated Daily Run-Rate
          </span>
          <div className="text-2xl font-bold text-emerald-500 mt-1">
            {formatPrice(dailyStats?.totalRevenue ?? 0)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Based on completed visits</p>
        </Card>
      </div>

      {/* Grid: Popular Services & Barber Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Services */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" />
              <span>Most Popular Services</span>
            </CardTitle>
            <CardDescription>Ranked by volume of completed treatments</CardDescription>
          </CardHeader>

          <CardContent className="divide-y divide-border/60">
            {popularServices.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No service history recorded yet.
              </p>
            ) : (
              popularServices.map((service, index) => (
                <div key={service.serviceId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-md bg-muted flex items-center justify-center font-bold text-foreground shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{service.serviceName}</h4>
                      <span className="text-muted-foreground font-mono text-[10px] uppercase">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-foreground">{service.count} haircuts</div>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      {formatPrice(service.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Barber Productivity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Barber Productivity</span>
            </CardTitle>
            <CardDescription>Volume and average haircut speeds per stylist</CardDescription>
          </CardHeader>

          <CardContent className="divide-y divide-border/60">
            {barberStats.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No barber statistics available.
              </p>
            ) : (
              barberStats.map((barber) => (
                <div key={barber.barberId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {barber.barberName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{barber.barberName}</h4>
                      <span className="text-muted-foreground">
                        Avg duration: {formatDuration(barber.averageServiceMinutes)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-semibold ${
                        BARBER_STATUS_COLORS[barber.status]
                      }`}
                    >
                      {barber.customersServed} served
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
