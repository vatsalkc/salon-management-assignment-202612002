export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const TOKEN_KEY = 'salon_token';
export const THEME_KEY = 'salon_theme';

export const QUEUE_STATUS_LABELS: Record<string, string> = {
  WAITING: 'Waiting',
  CALLED: 'Called',
  IN_SERVICE: 'In Service',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

export const BARBER_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  BUSY: 'Busy',
  ON_BREAK: 'On Break',
  OFFLINE: 'Offline',
};

export const QUEUE_STATUS_COLORS: Record<string, string> = {
  WAITING: 'bg-warning/10 text-warning border-warning/20',
  CALLED: 'bg-primary/10 text-primary border-primary/20',
  IN_SERVICE: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  COMPLETED: 'bg-success/10 text-success border-success/20',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
  NO_SHOW: 'bg-muted text-muted-foreground border-muted',
};

export const BARBER_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-success/10 text-success border-success/20',
  BUSY: 'bg-primary/10 text-primary border-primary/20',
  ON_BREAK: 'bg-warning/10 text-warning border-warning/20',
  OFFLINE: 'bg-muted text-muted-foreground border-muted',
};
