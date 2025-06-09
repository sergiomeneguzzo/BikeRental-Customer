import {User} from './user';
import {Accessory} from './accessories';
import {Insurance} from './insurance';
import {Bike} from './bike';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Booking {
  id?: string;
  userId?: User | string;
  guestEmail?: string;
  pickupDate: Date;
  pickupLocation: Location | string;
  dropoffDate: Date;
  dropoffLocation: Location | string;
  items: Bike[] | string[];
  accessories?: Accessory | string[];
  insurances?: Insurance | string[];
  extraLocationFee: number;
  totalPrice: number;
  status: ReservationStatus;
  reminderSent: boolean;
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
