import React, { useEffect, useState } from 'react';
import { queueService, TVDisplayData } from '../../services/queue.service';
import { useSocket } from '../../context/SocketContext';
import { Badge } from '../../components/ui/badge';
import { formatDuration, formatTime } from '../../utils/formatters';
import { BARBER_STATUS_COLORS, BARBER_STATUS_LABELS } from '../../utils/constants';
import { Scissors, Clock, Users, Sparkles, Volume2, Bell, Radio } from 'lucide-react';

export function TVDisplayPage() {
  const { socket, isConnected } = useSocket();
  const [data, setData] = useState<TVDisplayData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Live Clock Tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial Load & 30s Polling fallback
  useEffect(() => {
    loadTVData();
    const interval = setInterval(loadTVData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time synchronization via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      loadTVData();
    };

    socket.on('queue:updated', handleUpdate);
    socket.on('barber:status', handleUpdate);
    socket.on('settings:updated', handleUpdate);

    return () => {
      socket.off('queue:updated', handleUpdate);
      socket.off('barber:status', handleUpdate);
      socket.off('settings:updated', handleUpdate);
    };
  }, [socket]);

  const loadTVData = async () => {
    try {
      const tvData = await queueService.getTVData();
      setData(tvData);
    } catch (err) {
      console.error('Failed to load TV display data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formattedClock = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-hidden p-6 sm:p-8">
      {/* Top TV Header Bar */}
      <header className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Scissors className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>{data?.settings?.salonName || 'Elite Cuts Salon'}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-mono uppercase tracking-widest font-semibold border border-indigo-500/30">
                Live TV Lounge
              </span>
            </h1>
            <p className="text-sm text-zinc-400">
              Smart Queue Board • Please have a seat until your token is called
            </p>
          </div>
        </div>

        {/* Live Clock & Connection Pill */}
        <div className="text-right flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-mono text-zinc-400">
              {isConnected ? 'LIVE SYNC' : 'OFFLINE SYNC'}
            </span>
          </div>

          <div className="border-l border-zinc-800 pl-6">
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {formattedClock}
            </div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
              {formattedDate}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Split: Left (Barber Stations) & Right (Upcoming Queue) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 overflow-hidden">
        {/* LEFT: Barber Stations (Now In Chair) - 7 cols */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-zinc-200 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <span>Barber Stations</span>
            </h2>
            <span className="text-xs text-zinc-400">Active stylist chairs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {data?.barbers.map((barber) => {
              const activeEntry = barber.queueEntries && barber.queueEntries[0];

              return (
                <div
                  key={barber.id}
                  className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                    activeEntry
                      ? 'bg-zinc-900/90 border-indigo-500/50 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/20'
                      : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  {/* Barber Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">{barber.name}</h3>
                        <p className="text-xs text-zinc-400">
                          {barber.specialization || 'Master Stylist'}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2.5 py-0.5 uppercase tracking-wider font-semibold ${
                          BARBER_STATUS_COLORS[barber.status]
                        }`}
                      >
                        {BARBER_STATUS_LABELS[barber.status]}
                      </Badge>
                    </div>

                    {/* Customer Status */}
                    {activeEntry ? (
                      <div className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
                          Now Serving
                        </span>
                        <div className="font-mono text-5xl font-black text-white tracking-tight">
                          {activeEntry.tokenNumber}
                        </div>
                        <div className="text-base font-bold text-zinc-200 truncate">
                          {activeEntry.customerName}
                        </div>
                        <div className="text-xs text-zinc-400 truncate">
                          {activeEntry.services.map((s) => s.service?.name).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 py-8 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500 text-xs">
                        {barber.status === 'ON_BREAK'
                          ? 'Stylist is taking a short break'
                          : barber.status === 'OFFLINE'
                          ? 'Station is closed'
                          : 'Ready for next customer'}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span>Station #{barber.sortOrder + 1}</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {activeEntry ? 'IN SERVICE' : 'READY'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Waiting Queue & Called Board - 5 cols */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-zinc-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Next in Line</span>
            </h2>
            <Badge variant="outline" className="text-xs text-zinc-300 border-zinc-700">
              {data?.waitingQueue.length || 0} Waiting
            </Badge>
          </div>

          {/* Called Banner if any */}
          {data?.calledCustomers && data.calledCustomers.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 animate-pulse border border-indigo-400">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 shrink-0" />
                <div>
                  <span className="text-[11px] uppercase tracking-widest font-mono text-indigo-200 font-bold">
                    Now Proceeding to Chair
                  </span>
                  <div className="text-2xl font-black font-mono">
                    {data.calledCustomers.map((c) => c.tokenNumber).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waiting List */}
          <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 overflow-hidden flex flex-col">
            {data?.waitingQueue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <Clock className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm font-semibold">No wait time right now!</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Walk right in or scan QR to get your haircut.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto pr-1">
                {data?.waitingQueue.slice(0, 7).map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-12 rounded-lg bg-zinc-800 flex items-center justify-center font-mono font-black text-lg text-white">
                        {entry.tokenNumber}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{entry.customerName}</div>
                        <div className="text-xs text-zinc-400">
                          {entry.services.map((s) => s.service?.name).join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-indigo-400">
                        ~{entry.estimatedWaitMinutes}m
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                        Position #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Ticker */}
      <footer className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-medium">
        <div className="flex items-center gap-2">
          <Scissors className="h-3.5 w-3.5 text-indigo-400" />
          <span>Need a cut? Scan salon QR code to take your ticket on your smartphone.</span>
        </div>
        <div className="text-right font-mono text-[11px] text-zinc-600">
          Powered by Elite Cuts Queue Engine
        </div>
      </footer>
    </div>
  );
}
