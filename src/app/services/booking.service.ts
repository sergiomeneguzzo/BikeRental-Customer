import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {apiUrl} from '../../../secrets';
import {Location} from '../interfaces/location';
import {Bike, BikeType, BikeWithBusy} from '../interfaces/bike';
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

  confirmReservation(reservation: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${apiUrl}/bookings/confirm`, reservation);
  }

  getBikes(
    locationId: string,
    start?: Date,
    end?: Date
  ): Observable<BikeWithBusy[]> {
    let params = new HttpParams().set('locationId', locationId);
    if (start) params = params.set('start', start.toISOString());
    if (end)   params = params.set('end',   end.toISOString());

    return this.http
      .get<{ bikes: BikeWithBusy[] }>(`${apiUrl}/bikes`, { params })
      .pipe(map(res => res.bikes));
  }
}
