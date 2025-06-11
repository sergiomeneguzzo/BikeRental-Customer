export interface Location {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    zip: string;
    province: string;
  };
  isActive: boolean;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}
