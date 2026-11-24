// ─── User & Auth ─────────────────────────────────────────

export type Role = 'CUSTOMER' | 'RECEPTIONIST' | 'BARBER' | 'OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  barberId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: Role;
}

// ─── Barber ──────────────────────────────────────────────

export type BarberStatus = 'AVAILABLE' | 'BUSY' | 'ON_BREAK' | 'OFFLINE';

export interface Barber {
  id: string;
  userId: string;
  name: string;
  specialization: string | null;
  status: BarberStatus;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// ─── Service ─────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Queue ───────────────────────────────────────────────

export type QueueStatus =
  | 'WAITING'
  | 'CALLED'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface QueueEntry {
  id: string;
  tokenNumber: string;
  customerName: string;
  customerPhone: string;
  customerId: string | null;
  barberId: string | null;
  status: QueueStatus;
  position: number;
  joinedAt: string;
  calledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  estimatedWaitMinutes: number;
  notes: string | null;
  barber?: Barber | null;
  services: QueueEntryService[];
}

export interface QueueEntryService {
  id: string;
  queueEntryId: string;
  serviceId: string;
  service: Service;
}

export interface JoinQueuePayload {
  customerName: string;
  customerPhone: string;
  serviceIds: string[];
  barberId?: string | null;
  notes?: string;
}

// ─── Salon Settings ──────────────────────────────────────

export interface SalonSettings {
  id: string;
  salonName: string;
  isQueueOpen: boolean;
  openTime: string;
  closeTime: string;
  maxQueueSize: number;
  timezone: string;
  updatedAt: string;
}

// ─── Statistics ──────────────────────────────────────────

export interface DailyStats {
  customersServed: number;
  customersWaiting: number;
  averageWaitMinutes: number;
  totalRevenue: number;
  cancelledCount: number;
  noShowCount: number;
}

export interface BarberStats {
  barberId: string;
  barberName: string;
  customersServed: number;
  averageServiceMinutes: number;
  status: BarberStatus;
}

export interface ServiceStats {
  serviceId: string;
  serviceName: string;
  category?: string;
  count: number;
  revenue: number;
}

// ─── API Response ────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field: string; message: string }[];
}
