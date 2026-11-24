import React, { useEffect, useState } from 'react';
import { serviceService, CreateServicePayload } from '../../services/service.service';
import { Service } from '../../types';
import { formatPrice, formatDuration } from '../../utils/formatters';
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
  DialogTrigger,
} from '../../components/ui/dialog';
import { Plus, Scissors, Clock, Tag, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState(25);
  const [category, setCategory] = useState('Hair');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAll(true);
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(30);
    setPrice(25);
    setCategory('Hair');
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || '');
    setDurationMinutes(service.durationMinutes);
    setPrice(service.price);
    setCategory(service.category || 'Hair');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: CreateServicePayload = {
        name,
        description,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        category,
      };

      if (editingService) {
        await serviceService.update(editingService.id, payload);
      } else {
        await serviceService.create(payload);
      }
      setIsDialogOpen(false);
      loadServices();
    } catch (err) {
      console.error('Failed to save service:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceActive = async (service: Service) => {
    try {
      await serviceService.update(service.id, { isActive: !service.isActive });
      loadServices();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salon Services</h1>
          <p className="text-sm text-muted-foreground">
            Configure haircuts, treatments, pricing, and estimated durations
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-44 bg-muted/30" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Scissors className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-base mb-1">No services found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding your first haircut or package.
          </p>
          <Button onClick={openCreateDialog} size="sm">
            Add Service
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`relative overflow-hidden transition-all hover:shadow-md ${
                !service.isActive ? 'opacity-60 bg-muted/20' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider mb-2">
                      {service.category || 'General'}
                    </Badge>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>
                {service.description && (
                  <CardDescription className="line-clamp-2 text-xs pt-1">
                    {service.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-0 pb-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{formatDuration(service.durationMinutes)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{service.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </CardContent>

              <div className="flex items-center justify-between px-6 py-2.5 bg-muted/30 border-t border-border/50 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleServiceActive(service)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(service)}
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
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
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                Fill in the details for this salon service.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="srv-name">Service Name</Label>
                <Input
                  id="srv-name"
                  placeholder="e.g. Skin Fade Haircut"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="srv-duration">Duration (Minutes)</Label>
                  <Input
                    id="srv-duration"
                    type="number"
                    min="5"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="srv-price">Price (₹)</Label>
                  <Input
                    id="srv-price"
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="srv-category">Category</Label>
                <Input
                  id="srv-category"
                  placeholder="Hair, Beard, Combo, Facial..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="srv-desc">Description</Label>
                <Input
                  id="srv-desc"
                  placeholder="Optional brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
