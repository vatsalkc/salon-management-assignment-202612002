import React, { useEffect, useState } from 'react';
import { queueService } from '../../services/queue.service';
import { barberService } from '../../services/barber.service';
import { serviceService } from '../../services/service.service';
import { settingsService } from '../../services/settings.service';
import { useSocket } from '../../context/SocketContext';
import { QueueEntry, Barber, Service, QueueStatus, SalonSettings } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { formatDuration, formatPrice, formatTime } from '../../utils/formatters';
import {
  QUEUE_STATUS_COLORS,
  QUEUE_STATUS_LABELS,
  BARBER_STATUS_COLORS,
  BARBER_STATUS_LABELS,
} from '../../utils/constants';
import {
  Users,
  UserPlus,
  Bell,
  Play,
  CheckCircle,
  XCircle,
  SkipForward,
  UserX,
  Search,
  Filter,
  Clock,
  Scissors,
  Sparkles,
  Phone,
  RefreshCw,
  Power,
} from 'lucide-react';

export function ReceptionDashboardPage() {
  const { socket } = useSocket();

  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QueueStatus>('ALL');

  // Walk-in Registration Modal
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServiceIds, setWalkInServiceIds] = useState<string[]>([]);
  const [walkInBarberId, setWalkInBarberId] = useState('');
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);
  const [walkInError, setWalkInError] = useState<string | null>(null);

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetEntryForAssign, setTargetEntryForAssign] = useState<QueueEntry | null>(null);
  const [selectedBarberForAssign, setSelectedBarberForAssign] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = () => {
      loadData();
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('barber:status', handleQueueUpdated);
    socket.on('settings:updated', handleQueueUpdated);

    return () => {
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('barber:status', handleQueueUpdated);
      socket.off('settings:updated', handleQueueUpdated);
    };
  }, [socket]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [queueData, barbersData, servicesData, settingsData] = await Promise.all([
        queueService.getLiveQueue(),
        barberService.getAll(false),
        serviceService.getAll(false),
        settingsService.getSettings(),
      ]);
      setQueue(queueData);
      setBarbers(barbersData);
      setServices(servicesData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load reception data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleCallNext = async (entryId?: string) => {
    try {
      await queueService.callNext(entryId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to call customer');
    }
  };

  const handleStartService = async (entryId: string, barberId?: string) => {
    try {
      await queueService.startService(entryId, barberId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start service');
    }
  };

  const handleCompleteService = async (entryId: string) => {
    try {
      await queueService.completeService(entryId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete service');
    }
  };

  const handleSkipCustomer = async (entryId: string) => {
    try {
      await queueService.skipCustomer(entryId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to skip customer');
    }
  };

  const handleMarkNoShow = async (entryId: string) => {
    if (!window.confirm('Mark this customer as No-Show?')) return;
    try {
      await queueService.markNoShow(entryId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark no show');
    }
  };

  const handleCancelEntry = async (entryId: string) => {
    if (!window.confirm('Cancel this queue entry?')) return;
    try {
      await queueService.cancelQueue(entryId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel entry');
    }
  };

  const openAssignModal = (entry: QueueEntry) => {
    setTargetEntryForAssign(entry);
    setSelectedBarberForAssign(entry.barberId || '');
    setAssignModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!targetEntryForAssign || !selectedBarberForAssign) return;
    try {
      await queueService.assignBarber(targetEntryForAssign.id, selectedBarberForAssign);
      setAssignModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign barber');
    }
  };

  // Walk-in Registration
  const openWalkInDialog = () => {
    setWalkInName('');
    setWalkInPhone('');
    setWalkInServiceIds(services.length > 0 ? [services[0].id] : []);
    setWalkInBarberId('');
    setWalkInError(null);
    setIsWalkInOpen(true);
  };

  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError(null);

    if (walkInServiceIds.length === 0) {
      setWalkInError('Select at least one service');
      return;
    }

    setSubmittingWalkIn(true);
    try {
      await queueService.joinQueue({
        customerName: walkInName,
        customerPhone: walkInPhone,
        serviceIds: walkInServiceIds,
        barberId: walkInBarberId || undefined,
      });
      setIsWalkInOpen(false);
      loadData();
    } catch (err: any) {
      setWalkInError(err.response?.data?.message || 'Failed to register walk-in');
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  const toggleWalkInService = (id: string) => {
    setWalkInServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Filtered queue
  const filteredQueue = queue.filter((entry) => {
    const matchesStatus = statusFilter === 'ALL' || entry.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      entry.customerName.toLowerCase().includes(q) ||
      entry.customerPhone.includes(q) ||
      entry.tokenNumber.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const waitingCount = queue.filter((e) => e.status === 'WAITING').length;
  const calledCount = queue.filter((e) => e.status === 'CALLED').length;
  const inServiceCount = queue.filter((e) => e.status === 'IN_SERVICE').length;
  const availableBarbers = barbers.filter((b) => b.status === 'AVAILABLE').length;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reception Queue Desk</h1>
          <p className="text-sm text-muted-foreground">
            Monitor real-time customer flow, dispatch barbers, and register walk-ins
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => handleCallNext()}
            disabled={waitingCount === 0}
            className="gap-1.5 shadow-md shadow-primary/20 bg-primary"
          >
            <Bell className="h-4 w-4" />
            Call Next FIFO
          </Button>
          <Button size="sm" variant="default" onClick={openWalkInDialog} className="gap-1.5 bg-foreground text-background hover:bg-foreground/90">
            <UserPlus className="h-4 w-4" />
            Walk-in Registration
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Waiting</span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{waitingCount}</div>
          <span className="text-[11px] text-muted-foreground">Customers in queue</span>
        </Card>

        <Card className="p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Called</span>
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
          </div>
          <div className="text-2xl font-bold mt-1 text-primary">{calledCount}</div>
          <span className="text-[11px] text-muted-foreground">Proceeding to chair</span>
        </Card>

        <Card className="p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">In Service</span>
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-blue-500">{inServiceCount}</div>
          <span className="text-[11px] text-muted-foreground">Currently being cut</span>
        </Card>

        <Card className="p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Barbers Ready</span>
            <span className="h-2 w-2 rounded-full bg-success" />
          </div>
          <div className="text-2xl font-bold mt-1 text-success">
            {availableBarbers} / {barbers.length}
          </div>
          <span className="text-[11px] text-muted-foreground">Available stations</span>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'WAITING', 'CALLED', 'IN_SERVICE'] as const).map((status) => (
            <Button
              key={status}
              type="button"
              variant={statusFilter === status ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="h-8 text-xs font-medium"
            >
              {status === 'ALL' ? 'All Live' : QUEUE_STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
      </div>

      {/* Live Queue Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse h-20 bg-muted/20" />
          ))}
        </div>
      ) : filteredQueue.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-base mb-1">Queue is empty</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No customers currently waiting or in service matching your criteria.
          </p>
          <Button onClick={openWalkInDialog} size="sm">
            Register Walk-in Customer
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQueue.map((entry) => {
            const isWaiting = entry.status === 'WAITING';
            const isCalled = entry.status === 'CALLED';
            const isInService = entry.status === 'IN_SERVICE';

            return (
              <Card
                key={entry.id}
                className={`p-4 transition-all hover:shadow-md ${
                  isCalled
                    ? 'border-primary/80 bg-primary/5 shadow-md'
                    : isInService
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Token + Customer Info */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-16 rounded-xl bg-card border border-border shadow-sm flex flex-col items-center justify-center font-mono shrink-0">
                      <span className="text-sm font-extrabold text-foreground">
                        {entry.tokenNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        #{entry.position}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">
                          {entry.customerName}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            QUEUE_STATUS_COLORS[entry.status]
                          }`}
                        >
                          {QUEUE_STATUS_LABELS[entry.status]}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {entry.customerPhone}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-foreground">
                          {entry.services.map((s) => s.service?.name).join(', ')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(entry.joinedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Barber Badge */}
                  <div className="flex items-center gap-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                        Assigned Barber
                      </span>
                      <button
                        onClick={() => openAssignModal(entry)}
                        className="font-semibold text-foreground hover:text-primary underline text-xs transition-colors"
                      >
                        {entry.barber ? entry.barber.name : 'Any Available (Click to assign)'}
                      </button>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isWaiting && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleCallNext(entry.id)}
                        className="gap-1.5 h-8 text-xs bg-primary"
                      >
                        <Bell className="h-3.5 w-3.5" />
                        Call
                      </Button>
                    )}

                    {(isCalled || isWaiting) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartService(entry.id)}
                        className="gap-1.5 h-8 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Start
                      </Button>
                    )}

                    {isInService && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleCompleteService(entry.id)}
                        className="gap-1.5 h-8 text-xs"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Finish
                      </Button>
                    )}

                    {/* Quick Utility Actions */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSkipCustomer(entry.id)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      title="Move to end of queue"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkNoShow(entry.id)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-amber-600"
                      title="Mark No Show"
                    >
                      <UserX className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelEntry(entry.id)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                      title="Cancel ticket"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Walk-in Registration Modal */}
      <Dialog open={isWalkInOpen} onOpenChange={setIsWalkInOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleRegisterWalkIn}>
            <DialogHeader>
              <DialogTitle>Register Walk-in Customer</DialogTitle>
              <DialogDescription>
                Issue an instant ticket for in-person walk-ins.
              </DialogDescription>
            </DialogHeader>

            {walkInError && (
              <div className="p-3 my-2 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                {walkInError}
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wi-name">Customer Name</Label>
                  <Input
                    id="wi-name"
                    placeholder="e.g. Michael Scott"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wi-phone">Phone Number</Label>
                  <Input
                    id="wi-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label>Services</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {services.map((srv) => {
                    const isSelected = walkInServiceIds.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleWalkInService(srv.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/10 font-semibold'
                            : 'border-border bg-card hover:bg-accent'
                        }`}
                      >
                        <span className="truncate">{srv.name}</span>
                        <span>{formatPrice(srv.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Barber Assignment */}
              <div className="space-y-2">
                <Label htmlFor="wi-barber">Assign Barber (Optional)</Label>
                <select
                  id="wi-barber"
                  value={walkInBarberId}
                  onChange={(e) => setWalkInBarberId(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background"
                >
                  <option value="">Any Available Barber (Recommended)</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({BARBER_STATUS_LABELS[b.status]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWalkInOpen(false)}
                disabled={submittingWalkIn}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingWalkIn}>
                {submittingWalkIn ? 'Generating...' : 'Issue Token'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Barber Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Assign Customer to Barber</DialogTitle>
            <DialogDescription>
              Assign {targetEntryForAssign?.customerName} ({targetEntryForAssign?.tokenNumber}) to a stylist.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <Label>Choose Barber</Label>
            <select
              value={selectedBarberForAssign}
              onChange={(e) => setSelectedBarberForAssign(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background"
            >
              <option value="">Select a barber...</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.specialization || 'Stylist'} ({BARBER_STATUS_LABELS[b.status]})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignment} disabled={!selectedBarberForAssign}>
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
