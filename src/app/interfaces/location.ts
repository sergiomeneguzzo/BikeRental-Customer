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
  createdAt: Date;
  updatedAt: Date;
}
