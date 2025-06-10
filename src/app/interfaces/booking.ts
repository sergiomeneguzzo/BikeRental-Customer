import {User} from './user';
import {Accessory} from './accessories';
import {Insurance} from './insurance';
import {Bike} from './bike';
import {Location} from './location';

export interface Booking {
  id?: string;
  userId?: User | string;
  guestEmail?: string;
  pickupDate: Date;
  pickupLocation: Location;
  dropoffDate: Date;
  dropoffLocation: Location;
  items: Bike[];
  accessories?: Accessory | string[];
  insurances?: Insurance | string[];
  extraLocationFee: number;
  totalPrice: number;
  status?: string;
  reminderSent: boolean;
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
