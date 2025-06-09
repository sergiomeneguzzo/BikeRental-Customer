
export enum BikeStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  UNAVAILABLE = 'unavailable',
}

export interface Bike {
  id?: string;
  bikeType: BikeType;
  serialNumber?: string;
  currentLocation: Location | string;
  sizes: {
    sizeLabel: 'S' | 'M' | 'L' | 'XL';
    minHeightCm: number;
    maxHeightCm: number;
  }[];
  status: BikeStatus;
  notes?: string;
  picture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BikeType {
  _id: string;
  category: string;
  motorType: string;
  PriceHalfDay: number;
}
