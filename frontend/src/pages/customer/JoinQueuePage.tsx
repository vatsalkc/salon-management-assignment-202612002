import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { serviceService } from '../../services/service.service';
import { barberService } from '../../services/barber.service';
import { queueService } from '../../services/queue.service';
import { settingsService } from '../../services/settings.service';
import { Service, Barber, QueueEntry, SalonSettings } from '../../types';
import { WaitingScreen } from './WaitingScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { formatDuration, formatPrice } from '../../utils/formatters';
import {
  Scissors,
  Check,
  User,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function JoinQueuePage() {
  const { user } = useAuth();

  const [activeTicket, setActiveTicket] = useState<QueueEntry | null>(null);
  const [checkingTicket, setCheckingTicket] = useState(true);

  // Salon Data
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>(''); // empty string = Any Barber
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkActiveTicket();
    loadSalonData();
  }, [user]);

  const checkActiveTicket = async () => {
    try {
      setCheckingTicket(true);
      const ticket = await queueService.getCustomerActiveEntry(user?.phone || undefined);
      setActiveTicket(ticket);
    } catch {
      setActiveTicket(null);
    } finally {
      setCheckingTicket(false);
    }
  };

  const loadSalonData = async () => {
    try {
      setLoadingData(true);
      const [allServices, allBarbers, salonSettings] = await Promise.all([
        serviceService.getAll(false),
        barberService.getAll(false),
        settingsService.getSettings(),
      ]);
      setServices(allServices);
      setBarbers(allBarbers);
      setSettings(salonSettings);

      // Default select first service if available
      if (allServices.length > 0 && selectedServiceIds.length === 0) {
        setSelectedServiceIds([allServices[0].id]);
      }
    } catch (err) {
      console.error('Failed to load salon data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedServiceIds.length === 0) {
      setError('Please select at least one service');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please enter your name and phone number');
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await queueService.joinQueue({
        customerName,
        customerPhone,
        serviceIds: selectedServiceIds,
        barberId: selectedBarberId || undefined,
        notes: notes || undefined,
      });
      setActiveTicket(ticket);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to join queue. Please check details and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // If customer already has an active ticket, render WaitingScreen!
  if (checkingTicket) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (activeTicket) {
    return (
      <WaitingScreen
        entry={activeTicket}
        onTicketCancelled={() => setActiveTicket(null)}
        onRefresh={checkActiveTicket}
      />
    );
  }

  // Selected totals
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const isQueueClosed = settings && !settings.isQueueOpen;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-border/60 p-6 sm:p-8">
        <div className="max-w-xl space-y-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold text-primary">
            Smart Queue System
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {settings?.salonName || 'Elite Cuts Salon'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Join the digital queue from your phone. Pick your haircut, choose your preferred stylist, and get real-time live updates.
          </p>
        </div>
      </div>

      {isQueueClosed && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Queue is Currently Closed</h4>
            <p className="text-xs opacity-90">
              The salon is not currently taking walk-ins or new queue requests. Operating hours:{' '}
              {settings?.openTime} - {settings?.closeTime}.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Services Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </span>
              Select Services
            </h2>
            <span className="text-xs text-muted-foreground">
              {selectedServiceIds.length} selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                      : 'border-border hover:border-border/80 bg-card hover:bg-accent/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        {service.category || 'General'}
                      </span>
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{service.name}</h3>
                    {service.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/50 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(service.durationMinutes)}</span>
                    </div>
                    <span className="font-bold text-foreground">{formatPrice(service.price)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Preferred Barber Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </span>
              Choose Stylist / Barber
            </h2>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Any Barber Option */}
            <div
              onClick={() => setSelectedBarberId('')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedBarberId === ''
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                  : 'border-border hover:border-border/80 bg-card'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Any Barber</h4>
                  <p className="text-[11px] text-muted-foreground">Fastest Available</p>
                </div>
              </div>
            </div>

            {/* Specific Barbers */}
            {barbers.map((barber) => {
              const isSelected = selectedBarberId === barber.id;
              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                      : 'border-border hover:border-border/80 bg-card'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
                      {barber.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{barber.name}</h4>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                        {barber.specialization || 'Stylist'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Customer Information */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              3
            </span>
            Your Contact Information
          </h2>

          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cust-name">Your Full Name</Label>
                  <Input
                    id="cust-name"
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-phone">Mobile Phone Number</Label>
                  <Input
                    id="cust-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Required to track token and receive "It's your turn" call
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cust-notes">Special Requests / Notes (Optional)</Label>
                <Input
                  id="cust-notes"
                  placeholder="e.g. Skin sensitive, prefer low fade"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Submit Button */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Total Services:</span>
              <span className="text-xs font-bold">{selectedServices.length}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">Est. Time:</span>
              <span className="text-xs font-bold">{formatDuration(totalDuration)}</span>
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              {formatPrice(totalPrice)}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitting || isQueueClosed || selectedServiceIds.length === 0}
            className="w-full sm:w-auto px-8 gap-2 shadow-lg shadow-primary/20"
          >
            {submitting ? (
              'Joining Queue...'
            ) : (
              <>
                <span>Get Queue Token</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
