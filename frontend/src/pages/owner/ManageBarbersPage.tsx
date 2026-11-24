import React, { useEffect, useState } from 'react';
import { barberService, CreateBarberPayload } from '../../services/barber.service';
import { Barber, BarberStatus } from '../../types';
import { BARBER_STATUS_COLORS, BARBER_STATUS_LABELS } from '../../utils/constants';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Plus, Users, UserCheck, Coffee, Power, Phone, Mail, Sparkles, Edit2 } from 'lucide-react';

export function ManageBarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Hair & Beard Stylist');
  const [password, setPassword] = useState('password123');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      setLoading(true);
      const data = await barberService.getAll(true);
      setBarbers(data);
    } catch (err) {
      console.error('Failed to load barbers:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingBarber(null);
    setName('');
    setEmail('');
    setPhone('');
    setSpecialization('Classic & Modern Hairstyles');
    setPassword('password123');
    setIsDialogOpen(true);
  };

  const openEditDialog = (barber: Barber) => {
    setEditingBarber(barber);
    setName(barber.name);
    setEmail(barber.user?.email || '');
    setPhone(barber.user?.phone || '');
    setSpecialization(barber.specialization || '');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBarber) {
        await barberService.update(editingBarber.id, {
          name,
          specialization,
        });
      } else {
        const payload: CreateBarberPayload = {
          name,
          email,
          phone,
          specialization,
          password,
        };
        await barberService.create(payload);
      }
      setIsDialogOpen(false);
      loadBarbers();
    } catch (err) {
      console.error('Failed to save barber:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (barberId: string, newStatus: BarberStatus) => {
    try {
      await barberService.updateStatus(barberId, newStatus);
      setBarbers((prev) =>
        prev.map((b) => (b.id === barberId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Barbers & Stylists</h1>
          <p className="text-sm text-muted-foreground">
            Manage your salon team, shift statuses, and assignments
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Barber
        </Button>
      </div>

      {/* Barbers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-muted/30" />
          ))}
        </div>
      ) : barbers.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-base mb-1">No barbers found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add team members so customers can book directly with them.
          </p>
          <Button onClick={openCreateDialog} size="sm">
            Add Barber
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map((barber) => (
            <Card
              key={barber.id}
              className={`relative overflow-hidden transition-all hover:shadow-md ${
                !barber.isActive ? 'opacity-60 bg-muted/20' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{barber.name}</span>
                    </CardTitle>
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {barber.specialization || 'Professional Stylist'}
                    </p>
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
              </CardHeader>

              <CardContent className="pt-0 pb-4 space-y-3">
                <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/50 pt-3">
                  {barber.user?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{barber.user.email}</span>
                    </div>
                  )}
                  {barber.user?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{barber.user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Quick Status Bar */}
                <div className="pt-2">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                    Update Station Status:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={barber.status === 'AVAILABLE' ? 'default' : 'outline'}
                      className="h-7 text-[11px] px-1"
                      onClick={() => handleStatusChange(barber.id, 'AVAILABLE')}
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      Ready
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={barber.status === 'ON_BREAK' ? 'secondary' : 'outline'}
                      className="h-7 text-[11px] px-1"
                      onClick={() => handleStatusChange(barber.id, 'ON_BREAK')}
                    >
                      <Coffee className="h-3 w-3 mr-1" />
                      Break
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={barber.status === 'OFFLINE' ? 'destructive' : 'outline'}
                      className="h-7 text-[11px] px-1"
                      onClick={() => handleStatusChange(barber.id, 'OFFLINE')}
                    >
                      <Power className="h-3 w-3 mr-1" />
                      Off
                    </Button>
                  </div>
                </div>
              </CardContent>

              <div className="flex items-center justify-end px-6 py-2 bg-muted/30 border-t border-border/50 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(barber)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingBarber ? 'Edit Barber' : 'Add New Barber'}</DialogTitle>
              <DialogDescription>
                {editingBarber
                  ? 'Update barber profile and specialization.'
                  : 'Create a new barber account. They can login with these credentials.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="barber-name">Full Name</Label>
                <Input
                  id="barber-name"
                  placeholder="e.g. David Wilson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {!editingBarber && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="barber-email">Email</Label>
                    <Input
                      id="barber-email"
                      type="email"
                      placeholder="david@salon.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barber-phone">Phone</Label>
                    <Input
                      id="barber-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barber-password">Initial Password</Label>
                    <Input
                      id="barber-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="barber-spec">Specialization</Label>
                <Input
                  id="barber-spec"
                  placeholder="e.g. Fade Master, Beard Art, Colorist"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingBarber ? 'Update Profile' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
