import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {apiUrl} from '../../../secrets';
import {Location} from '../interfaces/location';
import {Bike, BikeType} from '../interfaces/bike';

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

  getBikes(): Observable<Bike[]> {
    return this.http.get<{ bikes: Bike[] }>(`${apiUrl}/bikes`)
      .pipe(map(res => res.bikes));
  }
}
