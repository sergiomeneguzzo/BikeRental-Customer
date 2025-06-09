
export enum BikeStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  UNAVAILABLE = 'unavailable',
}

export interface Bike {
  id?: string;
  bikeType: BikeType | string;
  serialNumber?: string;
  currentLocation: Location | string;
  status: BikeStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BikeType {
  category: 'City' | 'Mountain' | 'Gravel' | 'Road';
  motorType: 'Muscolare' | 'Elettrica';
  sizes: {
    sizeLabel: 'S' | 'M' | 'L' | 'XL';
    minHeightCm: number;
    maxHeightCm: number;
  }[];
  PriceHalfDay: number;
  createdAt: Date;
  updatedAt: Date;
}
