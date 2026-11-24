import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { queueService } from '../../services/queue.service';
import { barberService } from '../../services/barber.service';
import { QueueEntry, Barber, BarberStatus } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatDuration, formatPrice, formatTime } from '../../utils/formatters';
import {
  BARBER_STATUS_COLORS,
  BARBER_STATUS_LABELS,
  QUEUE_STATUS_COLORS,
  QUEUE_STATUS_LABELS,
} from '../../utils/constants';
import {
  Scissors,
  UserCheck,
  Coffee,
  Power,
  Play,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  RefreshCw,
  User,
  AlertCircle,
} from 'lucide-react';

export function BarberDashboardPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [currentBarber, setCurrentBarber] = useState<Barber | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<QueueEntry | null>(null);
  const [nextCustomer, setNextCustomer] = useState<QueueEntry | null>(null);
  const [completedToday, setCompletedToday] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Elapsed timer for in-service client
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    loadBarberData();
  }, [user]);

  // Elapsed timer tick
  useEffect(() => {
    if (!currentCustomer?.startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(currentCustomer.startedAt).getTime();
    const interval = setInterval(() => {
      const nowMs = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentCustomer?.startedAt]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = () => {
      loadBarberData();
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('barber:status', handleQueueUpdated);

    return () => {
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('barber:status', handleQueueUpdated);
    };
  }, [socket, currentBarber?.id]);

  const loadBarberData = async () => {
    try {
      setLoading(true);
      // Fetch barbers to find this user's barber profile
      const allBarbers = await barberService.getAll(true);
      const myBarber = allBarbers.find(
        (b) => b.userId === user?.id || b.id === user?.barberId
      ) || allBarbers[0]; // fallback to first barber if testing as admin

      setCurrentBarber(myBarber);

      // Fetch live queue
      const liveQueue = await queueService.getLiveQueue();

      // Current customer: in service with this barber
      const inService = liveQueue.find(
        (e) => e.status === 'IN_SERVICE' && e.barberId === myBarber?.id
      );
      setCurrentCustomer(inService || null);

      // Next customer: called for this barber, or next waiting customer
      const called = liveQueue.find(
        (e) => e.status === 'CALLED' && (!e.barberId || e.barberId === myBarber?.id)
      );
      const nextWaiting = liveQueue.find(
        (e) => e.status === 'WAITING' && (!e.barberId || e.barberId === myBarber?.id)
      );
      setNextCustomer(called || nextWaiting || null);
    } catch (err) {
      console.error('Failed to load barber station:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: BarberStatus) => {
    if (!currentBarber) return;
    try {
      await barberService.updateStatus(currentBarber.id, status);
      setCurrentBarber((prev) => (prev ? { ...prev, status } : null));
    } catch (err) {
      console.error('Failed to update barber status:', err);
    }
  };

  const handleStartService = async (entryId: string) => {
    if (!currentBarber) return;
    try {
      await queueService.startService(entryId, currentBarber.id);
      loadBarberData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start service');
    }
  };

  const handleCompleteService = async (entryId: string) => {
    try {
      await queueService.completeService(entryId);
      loadBarberData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete service');
    }
  };

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Workstation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span>Barber Workstation</span>
            {currentBarber && (
              <span className="text-lg font-normal text-muted-foreground">
                ({currentBarber.name})
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your chair, serve clients, and control your station availability
          </p>
        </div>

        {/* Station Availability Controls */}
        {currentBarber && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-1 uppercase font-semibold ${
                BARBER_STATUS_COLORS[currentBarber.status]
              }`}
            >
              {BARBER_STATUS_LABELS[currentBarber.status]}
            </Badge>

            <div className="flex items-center gap-1.5 p-1 rounded-lg border bg-card">
              <Button
                size="sm"
                variant={currentBarber.status === 'AVAILABLE' ? 'default' : 'ghost'}
                onClick={() => handleStatusChange('AVAILABLE')}
                className="h-7 text-xs px-2 gap-1"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Ready
              </Button>
              <Button
                size="sm"
                variant={currentBarber.status === 'ON_BREAK' ? 'secondary' : 'ghost'}
                onClick={() => handleStatusChange('ON_BREAK')}
                className="h-7 text-xs px-2 gap-1"
              >
                <Coffee className="h-3.5 w-3.5" />
                Break
              </Button>
              <Button
                size="sm"
                variant={currentBarber.status === 'OFFLINE' ? 'destructive' : 'ghost'}
                onClick={() => handleStatusChange('OFFLINE')}
                className="h-7 text-xs px-2 gap-1"
              >
                <Power className="h-3.5 w-3.5" />
                Off
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Break Mode Warning */}
      {currentBarber?.status === 'ON_BREAK' && (
        <div className="p-4 rounded-xl bg-warning/10 text-warning border border-warning/20 flex items-center gap-3">
          <Coffee className="h-5 w-5 shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-sm">Station is Paused (On Break)</h4>
            <p>
              Auto-assignment is paused while you are on break. Switch to "Ready" when back.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Current Chair & Next Up */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CURRENT CHAIR */}
        <Card className="border-border/80 shadow-lg relative overflow-hidden">
          <div className="h-1.5 bg-blue-500 w-full" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 font-bold uppercase tracking-wider">
                In Your Chair Now
              </Badge>
              {currentCustomer && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-md">
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  <span>{formatElapsed(elapsedSeconds)}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentCustomer ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-4xl font-extrabold text-foreground">
                      {currentCustomer.tokenNumber}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mt-1">
                      {currentCustomer.customerName}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {currentCustomer.customerPhone}
                    </p>
                  </div>
                </div>

                {/* Services */}
                <div className="p-3 rounded-xl border border-border/60 bg-muted/30 space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Services to perform:
                  </span>
                  <div className="space-y-1 text-xs">
                    {currentCustomer.services.map((s) => (
                      <div key={s.id} className="flex justify-between font-medium">
                        <span>{s.service?.name}</span>
                        <span className="text-muted-foreground">
                          {formatDuration(s.service?.durationMinutes || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentCustomer.notes && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                    <span className="font-semibold">Client Note: </span>
                    {currentCustomer.notes}
                  </div>
                )}

                <Button
                  size="lg"
                  variant="success"
                  onClick={() => handleCompleteService(currentCustomer.id)}
                  className="w-full gap-2 shadow-md shadow-success/20 font-bold"
                >
                  <CheckCircle className="h-5 w-5" />
                  Complete Haircut & Finish
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Scissors className="h-10 w-10 mx-auto opacity-30" />
                <h4 className="font-semibold text-sm">Chair is empty</h4>
                <p className="text-xs">
                  {nextCustomer
                    ? 'Start service with the next customer waiting in line.'
                    : 'No customers currently in your chair.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NEXT UP IN LINE */}
        <Card className="border-border/80 shadow-md relative overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary font-bold uppercase tracking-wider">
                Next Customer In Line
              </Badge>
              {nextCustomer && (
                <Badge
                  variant="outline"
                  className={`text-[10px] ${QUEUE_STATUS_COLORS[nextCustomer.status]}`}
                >
                  {QUEUE_STATUS_LABELS[nextCustomer.status]}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {nextCustomer ? (
              <div className="space-y-4">
                <div>
                  <div className="font-mono text-4xl font-extrabold text-foreground">
                    {nextCustomer.tokenNumber}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-1">
                    {nextCustomer.customerName}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" />
                    {nextCustomer.customerPhone}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/60 bg-muted/30 space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Requested Services:
                  </span>
                  <div className="space-y-1 text-xs">
                    {nextCustomer.services.map((s) => (
                      <div key={s.id} className="flex justify-between font-medium">
                        <span>{s.service?.name}</span>
                        <span className="text-muted-foreground">
                          {formatDuration(s.service?.durationMinutes || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => handleStartService(nextCustomer.id)}
                  disabled={!!currentCustomer}
                  className="w-full gap-2 shadow-md shadow-primary/20 font-bold"
                >
                  <Play className="h-5 w-5" />
                  {currentCustomer ? 'Finish Current Client First' : 'Take Next Client into Chair'}
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Sparkles className="h-10 w-10 mx-auto opacity-30" />
                <h4 className="font-semibold text-sm">No customers in queue</h4>
                <p className="text-xs">The waiting line is currently clear.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
