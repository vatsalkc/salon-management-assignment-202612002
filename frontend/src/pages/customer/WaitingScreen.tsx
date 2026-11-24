import React, { useEffect, useState } from 'react';
import { QueueEntry } from '../../types';
import { queueService } from '../../services/queue.service';
import { useSocket } from '../../context/SocketContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatDuration, formatPrice, formatTime } from '../../utils/formatters';
import { QUEUE_STATUS_COLORS, QUEUE_STATUS_LABELS } from '../../utils/constants';
import {
  Clock,
  User,
  Scissors,
  Bell,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface WaitingScreenProps {
  entry: QueueEntry;
  onTicketCancelled?: () => void;
  onRefresh?: () => void;
}

export function WaitingScreen({ entry: initialEntry, onTicketCancelled, onRefresh }: WaitingScreenProps) {
  const [entry, setEntry] = useState<QueueEntry>(initialEntry);
  const [cancelling, setCancelling] = useState(false);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    setEntry(initialEntry);
    if (initialEntry.status === 'CALLED') {
      setShowNotificationBanner(true);
    }
  }, [initialEntry]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = async () => {
      try {
        const updated = await queueService.getEntryById(entry.id);
        if (updated) {
          if (entry.status !== 'CALLED' && updated.status === 'CALLED') {
            setShowNotificationBanner(true);
            // Play polite ding if audio is permitted
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(() => {});
            } catch {}
          }
          setEntry(updated);
        }
      } catch (err) {
        console.error('Failed to update ticket state:', err);
      }
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('queue:called', (calledEntry: QueueEntry) => {
      if (calledEntry.id === entry.id) {
        setEntry(calledEntry);
        setShowNotificationBanner(true);
      }
    });

    return () => {
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('queue:called');
    };
  }, [socket, entry.id, entry.status]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your place in the queue?')) {
      return;
    }
    setCancelling(true);
    try {
      await queueService.cancelQueue(entry.id);
      if (onTicketCancelled) onTicketCancelled();
    } catch (err) {
      console.error('Failed to cancel ticket:', err);
    } finally {
      setCancelling(false);
    }
  };

  const isCalled = entry.status === 'CALLED';
  const isInService = entry.status === 'IN_SERVICE';
  const isCompleted = entry.status === 'COMPLETED';

  const totalPrice = entry.services.reduce((sum, s) => sum + (s.service?.price || 0), 0);
  const totalDuration = entry.services.reduce((sum, s) => sum + (s.service?.durationMinutes || 0), 0);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* "IT'S YOUR TURN" Banner */}
      {isCalled && (
        <div className="p-4 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25 border border-primary-foreground/20 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">It's Your Turn!</h2>
              <p className="text-xs text-primary-foreground/90">
                Please proceed to{' '}
                <span className="font-semibold underline">
                  {entry.barber ? `${entry.barber.name}'s chair` : 'the front barber station'}
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Ticket Card */}
      <Card className="overflow-hidden border-border/80 shadow-2xl relative">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Scissors className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live Queue Ticket
              </span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs px-3 py-1 font-bold uppercase tracking-wider ${
                QUEUE_STATUS_COLORS[entry.status]
              }`}
            >
              {QUEUE_STATUS_LABELS[entry.status]}
            </Badge>
          </div>

          {/* Large Token Display */}
          <div className="text-center py-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              Your Token Number
            </p>
            <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
              {entry.tokenNumber}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Customer: <span className="font-semibold text-foreground">{entry.customerName}</span> ({entry.customerPhone})
            </p>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Position */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-center space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Queue Position</p>
              <div className="text-3xl font-extrabold text-foreground">
                {isCalled ? (
                  <span className="text-primary text-xl font-bold flex items-center justify-center gap-1">
                    <Sparkles className="h-5 w-5" /> Next Up!
                  </span>
                ) : isInService ? (
                  <span className="text-blue-500 text-lg font-bold">In Chair</span>
                ) : isCompleted ? (
                  <span className="text-success text-lg font-bold">Finished</span>
                ) : (
                  `#${entry.position}`
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {entry.position === 1
                  ? 'You are next in line'
                  : entry.position > 1
                  ? `${entry.position - 1} customer(s) ahead`
                  : 'Being served'}
              </p>
            </div>

            {/* Estimated Wait */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-center space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Estimated Wait</p>
              <div className="text-3xl font-extrabold text-foreground flex items-center justify-center gap-1">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span>{isCalled || isInService ? '0m' : `${entry.estimatedWaitMinutes}m`}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isCalled || isInService ? 'Ready now' : 'Approximate wait time'}
              </p>
            </div>
          </div>

          {/* Assigned Barber */}
          <div className="p-4 rounded-xl border border-border/60 bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stylist / Barber</p>
                <p className="text-sm font-semibold text-foreground">
                  {entry.barber ? entry.barber.name : 'First Available Barber'}
                </p>
              </div>
            </div>
            {entry.barber && (
              <Badge variant="outline" className="text-xs">
                {entry.barber.specialization || 'Master Barber'}
              </Badge>
            )}
          </div>

          {/* Selected Services Breakdown */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Selected Services ({entry.services.length})
            </p>
            <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-muted/20">
              {entry.services.map((s) => (
                <div key={s.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-foreground">{s.service?.name}</span>
                    <span className="text-muted-foreground ml-2">
                      ({formatDuration(s.service?.durationMinutes || 0)})
                    </span>
                  </div>
                  <span className="font-semibold">{formatPrice(s.service?.price || 0)}</span>
                </div>
              ))}
              <div className="p-3 bg-muted/40 flex items-center justify-between text-xs font-bold">
                <span>Total ({formatDuration(totalDuration)})</span>
                <span className="text-sm text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Joined At Timestamp */}
          <div className="text-center text-[11px] text-muted-foreground">
            Joined queue at {formatTime(entry.joinedAt)}
          </div>

          {/* Actions */}
          {!isCompleted && (
            <div className="pt-2 flex items-center gap-3">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} className="flex-1 gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                {cancelling ? 'Cancelling...' : 'Leave Queue'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
