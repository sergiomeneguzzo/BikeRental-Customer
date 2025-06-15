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

  confirmReservation(reservationId: string): Observable<Booking> {
    return this.http.post<Booking>(
      `${apiUrl}/bookings/confirm`,
      { reservationId }
    );
  }

  getUserReservation(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${apiUrl}/bookings/user`);
  }

  getPendingReservations(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${apiUrl}/bookings/pending`);
  }

  cancelReservation(bookingId: string): Observable<any> {
    return this.http.put(`${apiUrl}/bookings/cancel/${bookingId}`, {});
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${apiUrl}/bookings/${id}`);
  }

  updateBooking(id: string, updateData: any): Observable<Booking> {
    return this.http.put<Booking>(`${apiUrl}/bookings/${id}`, updateData);
  }

  getBikes(
    locationId: string,
    start?: Date,
    end?: Date
  ): Observable<BikeWithBusy[]> {
    let params = new HttpParams().set('locationId', locationId);
    if (start) params = params.set('pickupDate', start.toISOString());
    if (end)   params = params.set('dropoffDate', end.toISOString());
    return this.http.get<BikeWithBusy[]>(`${apiUrl}/bikes`, { params });
  }


  getUnavailableDatesByLocation(locationId: string): Observable<string[]> {
    let params = new HttpParams().set('locationId', locationId);
    return this.http.get<string[]>(`${apiUrl}/bookings/unavailable-dates`, { params });
  }
}
