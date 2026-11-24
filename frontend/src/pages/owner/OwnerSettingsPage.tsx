import React, { useEffect, useState } from 'react';
import { settingsService } from '../../services/settings.service';
import { SalonSettings } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Settings, Save, CheckCircle2, Power } from 'lucide-react';

export function OwnerSettingsPage() {
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [salonName, setSalonName] = useState('');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('21:00');
  const [maxQueueSize, setMaxQueueSize] = useState(50);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [isQueueOpen, setIsQueueOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setSalonName(data.salonName);
      setOpenTime(data.openTime);
      setCloseTime(data.closeTime);
      setMaxQueueSize(data.maxQueueSize);
      setTimezone(data.timezone);
      setIsQueueOpen(data.isQueueOpen);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    try {
      const updated = await settingsService.updateSettings({
        salonName,
        openTime,
        closeTime,
        maxQueueSize: Number(maxQueueSize),
        timezone,
        isQueueOpen,
      });
      setSettings(updated);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-border/70">
        <h1 className="text-2xl font-bold tracking-tight">Salon Operating Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure business profile, daily operating hours, and capacity limits
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-success/10 text-success border border-success/20 flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Settings saved successfully. All screens synchronized.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Salon Details</CardTitle>
            <CardDescription>Brand identity displayed on tickets and TV screens</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s-name">Salon Name</Label>
              <Input
                id="s-name"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-open">Opening Time</Label>
                <Input
                  id="s-open"
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-close">Closing Time</Label>
                <Input
                  id="s-close"
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-max">Max Queue Capacity</Label>
                <Input
                  id="s-max"
                  type="number"
                  min="1"
                  max="500"
                  value={maxQueueSize}
                  onChange={(e) => setMaxQueueSize(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-tz">Timezone</Label>
                <Input
                  id="s-tz"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Queue Toggle Switch */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Queue Reception State</Label>
                <p className="text-xs text-muted-foreground">
                  When closed, customers cannot take new tokens online or via kiosk.
                </p>
              </div>

              <Button
                type="button"
                variant={isQueueOpen ? 'default' : 'destructive'}
                size="sm"
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className="gap-1.5"
              >
                <Power className="h-4 w-4" />
                {isQueueOpen ? 'Queue is OPEN' : 'Queue is CLOSED'}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-border/50 pt-4">
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
