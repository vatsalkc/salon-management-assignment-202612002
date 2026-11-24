import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { queueService } from '../../services/queue.service';
import { QueueEntry } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatDuration, formatPrice, formatDate, formatTime } from '../../utils/formatters';
import { QUEUE_STATUS_COLORS, QUEUE_STATUS_LABELS } from '../../utils/constants';
import { Clock, History, Scissors, User } from 'lucide-react';

export function CustomerHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await queueService.getCustomerHistory(user?.phone);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-2 border-b border-border/70">
        <h1 className="text-2xl font-bold tracking-tight">Queue History</h1>
        <p className="text-sm text-muted-foreground">
          View your past visits, salon services, and tickets
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-28 bg-muted/30" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <History className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-base mb-1">No past salon visits</h3>
          <p className="text-sm text-muted-foreground">
            Your previous tickets will appear here once completed.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => {
            const totalPrice = entry.services.reduce(
              (sum, s) => sum + (s.service?.price || 0),
              0
            );

            return (
              <Card key={entry.id} className="p-4 sm:p-5 transition-all hover:shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-14 rounded-xl bg-muted flex items-center justify-center font-mono font-bold text-lg text-foreground shrink-0 border">
                      {entry.tokenNumber}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            QUEUE_STATUS_COLORS[entry.status]
                          }`}
                        >
                          {QUEUE_STATUS_LABELS[entry.status]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.joinedAt)} at {formatTime(entry.joinedAt)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {entry.services.map((s) => s.service?.name).join(', ')}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {entry.barber && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.barber.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:pl-6 sm:border-border/60">
                    <div className="text-base font-bold text-foreground">
                      {formatPrice(totalPrice)}
                    </div>
                    <span className="text-xs text-muted-foreground">Total amount</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
