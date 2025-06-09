import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {apiUrl} from '../../../secrets';
import {Location} from '../interfaces/location';
import {Bike, BikeType} from '../interfaces/bike';
import {Insurance} from '../interfaces/insurance';
import {Accessory} from '../interfaces/accessories';
import {Booking} from '../interfaces/booking';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) {}

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${apiUrl}/locations`);
  }

  getBikeTypes(): Observable<BikeType[]> {
    return this.http.get<BikeType[]>(`${apiUrl}/biketypes`);
  }

  getInsurances(): Observable<Insurance[]> {
    return this.http.get<Insurance[]>(`${apiUrl}/insurances`);
  }

  getAccessories(): Observable<Accessory[]> {
    return this.http.get<Accessory[]>(`${apiUrl}/accessories`);
  }

  createReservation(reservation: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${apiUrl}/bookings`, reservation);
  }

  getBikes(locationId: string, date?: Date): Observable<Bike[]> {
    let params = new HttpParams().set('location', locationId);
    if (date) params = params.set('date', date.toISOString());
    return this.http
      .get<{ bikes: Bike[] }>(`${apiUrl}/bikes`, { params })
      .pipe(map(res => res.bikes));
  }

}
