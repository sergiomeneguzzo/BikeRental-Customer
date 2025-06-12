import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Booking} from '../../../interfaces/booking';
import {Bike, BikeType} from '../../../interfaces/bike';
import {Accessory} from '../../../interfaces/accessories';
import {Insurance} from '../../../interfaces/insurance';
import {catchError, filter, forkJoin, map, Observable, of, Subject, switchMap, takeUntil} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {BookingService} from '../../../services/booking.service';
import {NotificationService} from '../../../services/notification.service';
import {Location} from '../../../interfaces/location';

@Component({
  selector: 'app-edit-booking',
  standalone: false,
  templateUrl: './edit-booking.component.html',
  styleUrl: './edit-booking.component.scss'
})
export class EditBookingComponent implements OnInit, OnDestroy{
  bookingForm!: FormGroup;
  bookingId!: string;
  originalBooking!: Booking;
  isLoading = true;
  locations: Location[] = [];
  availableBikes: Bike[] = [];
  accessories: Accessory[] = [];
  insurances: Insurance[] = [];
  bikeTypes: BikeType[] = [];

  minDate: Date = new Date();
  maxDate: Date = new Date();
  invalidDates: Date[] = [];

  private destroyed$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private bookingSrv: BookingService,
    private notify: NotificationService
  ) {
    this.minDate.setDate(this.minDate.getDate());
    this.maxDate.setFullYear(this.minDate.getFullYear() + 1);
  }

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id')!;
    if (!this.bookingId) {
      this.notify.errorMessage('ID prenotazione non fornito.');
      this.router.navigate(['/account']);
      return;
    }

    this.initForm();
    this.loadBookingData();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private initForm(): void {
    this.bookingForm = this.fb.group({
      pickupDate: [{ value: null, disabled: true }, Validators.required],
      pickupLocation: [{ value: null, disabled: true }, Validators.required],
      dropoffDate: [{ value: null, disabled: true }, Validators.required],
      dropoffLocation: [null, Validators.required],
      items: [[], Validators.required],
      accessories: [[]],
      insurances: [[]],
      totalPrice: [{ value: 0, disabled: true }],
    });

    this.bookingForm.get('dropoffLocation')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => this.calculateTotalPrice());
    this.bookingForm.get('items')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => this.calculateTotalPrice());
    this.bookingForm.get('accessories')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => this.calculateTotalPrice());
    this.bookingForm.get('insurances')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => this.calculateTotalPrice());
  }

  private loadBookingData(): void {
    this.isLoading = true;
    forkJoin({
      booking: this.bookingSrv.getBookingById(this.bookingId).pipe(
        catchError(err => {
          this.notify.errorMessage('Errore nel caricamento della prenotazione.');
          this.router.navigate(['/profile']);
          return of(null);
        })
      ),
      locations: this.bookingSrv.getLocations(),
      accessories: this.bookingSrv.getAccessories(),
      insurances: this.bookingSrv.getInsurances(),
      bikeTypes: this.bookingSrv.getBikeTypes()
    }).pipe(
      takeUntil(this.destroyed$),
      filter(({ booking }) => !!booking),
      switchMap(({ booking, locations, accessories, insurances, bikeTypes }) => {
        this.originalBooking = booking as Booking;
        this.locations = locations;
        this.accessories = accessories;
        this.insurances = insurances;
        this.bikeTypes = bikeTypes;

        this.bookingForm.patchValue({
          pickupDate: new Date(this.originalBooking.pickupDate),
          pickupLocation: this.originalBooking.pickupLocation,
          dropoffDate: new Date(this.originalBooking.dropoffDate),
          dropoffLocation: this.originalBooking.dropoffLocation,
          accessories: Array.isArray(this.originalBooking.accessories)
            ? (this.originalBooking.accessories as unknown as Accessory[]).map(a => a._id)
            : this.originalBooking.accessories,
          insurances: Array.isArray(this.originalBooking.insurances)
            ? (this.originalBooking.insurances as unknown as Insurance[]).map(i => i._id)
            : this.originalBooking.insurances,
        });

        const currentBikeIds = (this.originalBooking.items as Bike[])
          .map(b => (b as any)._id as string)
          .filter(id => !!id);
        this.bookingForm.get('items')!.setValue(currentBikeIds);

        this.onDateOrLocationChange();
        return of(true);
      }),
      catchError(err => {
        this.notify.errorMessage('Errore durante il caricamento dei dati.');
        console.error('Loading error:', err);
        this.isLoading = false;
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.calculateTotalPrice();
        this.isLoading = false;
      }
    });
  }

  private onDateOrLocationChange(): void {
    const pickupDate = this.bookingForm.get('pickupDate')?.value;
    const dropoffDate = this.bookingForm.get('dropoffDate')?.value;
    const pickupLocation = this.bookingForm.get('pickupLocation')?.value;
    if (pickupDate && dropoffDate && pickupLocation && pickupLocation._id) {
      this.loadAvailableBikes().subscribe();
      this.getDisabledDatesForLocation(pickupLocation._id);
    } else {
      this.availableBikes = [];
      this.invalidDates = [];
    }
    this.calculateTotalPrice();
  }

  private loadAvailableBikes(): Observable<any> {
    const pickupDate = this.bookingForm.get('pickupDate')?.value;
    const dropoffDate = this.bookingForm.get('dropoffDate')?.value;
    const pickupLocationId = (this.bookingForm.get('pickupLocation')?.value as Location)?._id;

    if (!pickupDate || !(pickupDate instanceof Date) || !dropoffDate || !(dropoffDate instanceof Date) || !pickupLocationId) {
      this.availableBikes = [];
      return of(null);
    }

    return this.bookingSrv.getBikes(pickupLocationId, pickupDate, dropoffDate)
      .pipe(
        map(bikes => {
          const receivedBikes: Bike[] = bikes as Bike[];

          const normalizedBikes: Bike[] = receivedBikes.map(b => ({
            ...b,
            _id: b._id || (b as any).id
          }));

          const originalBikeIds = Array.isArray(this.originalBooking.items)
            ? (this.originalBooking.items as Bike[]).map(b => b._id || b)
            : [];
          const combinedBikes: Bike[] = [...normalizedBikes];

          originalBikeIds.forEach(originalId => {
            if (!combinedBikes.some(b => b._id === originalId)) {
              const originalBike = (this.originalBooking.items as Bike[]).find(b => (b as any)._id === originalId);
              if (originalBike) {
                combinedBikes.push(originalBike);
              }
            }
          });
          this.availableBikes = combinedBikes.filter((bike, idx, arr) =>
            idx === arr.findIndex(b => b._id === bike._id)
          );
          const currentSelected = this.bookingForm.get('items')?.value as string[];
          const filteredSelected = currentSelected.filter(id => combinedBikes.some(b => b._id === id));
          this.bookingForm.get('items')?.setValue(filteredSelected);
          return receivedBikes;
        }),
        catchError(err => {
          this.notify.errorMessage('Errore nel recupero delle bici disponibili.');
          console.error('Bikes loading error:', err);
          this.availableBikes = [];
          return of(null);
        })
      );
  }

  private getDisabledDatesForLocation(locationId: string): void {
    if (!locationId) {
      this.invalidDates = [];
      return;
    }
    this.bookingSrv.getUnavailableDatesByLocation(locationId).pipe(
      takeUntil(this.destroyed$),
      catchError(err => {
        this.notify.errorMessage('Errore nel recupero delle date non disponibili.');
        console.error('Disabled dates error:', err);
        return of([]);
      })
    ).subscribe(dates => {
      this.invalidDates = dates.map((d: string) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date;
      });

      const now = new Date();
      now.setHours(0,0,0,0);
      const originalPickupDate = new Date(this.originalBooking.pickupDate);
      originalPickupDate.setHours(0,0,0,0);

      const twoDaysBeforeOriginalPickup = new Date(this.originalBooking.pickupDate);
      twoDaysBeforeOriginalPickup.setDate(twoDaysBeforeOriginalPickup.getDate() - 2);
      twoDaysBeforeOriginalPickup.setHours(0,0,0,0);

      if (now > twoDaysBeforeOriginalPickup) {
        let tempDate = new Date(now);
        while(tempDate <= originalPickupDate) {
          if (!this.invalidDates.some(d => d.getTime() === tempDate.getTime())) {
            this.invalidDates.push(new Date(tempDate));
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }
      }
    });
  }

  calculateTotalPrice(): void {
    const pickupLocation = this.bookingForm.get('pickupLocation')?.value as Location;
    const dropoffLocation = this.bookingForm.get('dropoffLocation')?.value as Location;
    const selectedBikeIds = this.bookingForm.get('items')?.value as string[];
    const selectedAccessoryIds = this.bookingForm.get('accessories')?.value as string[];
    const selectedInsuranceIds = this.bookingForm.get('insurances')?.value as string[];
    const pickupDate = this.bookingForm.get('pickupDate')?.value as Date;
    const dropoffDate = this.bookingForm.get('dropoffDate')?.value as Date;

    let total = 0;

    if (!pickupDate || !dropoffDate || !selectedBikeIds.length) {
      this.bookingForm.get('totalPrice')?.setValue(0);
      return;
    }

    const diffMs = dropoffDate.getTime() - pickupDate.getTime();
    let rentalHalfDays = Math.ceil(diffMs / (1000 * 60 * 60 * 4));
    if (rentalHalfDays === 0 && diffMs > 0) {
      rentalHalfDays = 1;
    } else if (diffMs <= 0) {
      this.bookingForm.get('totalPrice')?.setValue(0);
      return;
    }

    selectedBikeIds.forEach(bikeId => {
      const bike = this.availableBikes.find(b => b._id === bikeId);
      if (bike && bike.bikeType && (bike.bikeType as BikeType).PriceHalfDay) {
        total += (bike.bikeType as BikeType).PriceHalfDay * rentalHalfDays;
      }
    });
    selectedAccessoryIds.forEach(accId => {
      const accessory = this.accessories.find(a => a._id === accId);
      if (accessory && accessory.price !== undefined) {
        total += accessory.price;
      }
    });
    selectedInsuranceIds.forEach(insId => {
      const insurance = this.insurances.find(i => i._id === insId);
      if (insurance && insurance.price !== undefined) {
        total += insurance.price;
      }
    });

    const originalPickupLocationId = this.originalBooking?.pickupLocation?._id || this.originalBooking?.pickupLocation;
    const originalDropoffLocationId = this.originalBooking?.dropoffLocation?._id || this.originalBooking?.dropoffLocation;
    const currentPickupLocationId = pickupLocation?._id;
    const currentDropoffLocationId = dropoffLocation?._id;

    const originalHadExtraFee = originalPickupLocationId !== originalDropoffLocationId;

    const currentNeedsExtraFee = currentPickupLocationId && currentDropoffLocationId &&
      currentPickupLocationId !== currentDropoffLocationId;

    if (originalHadExtraFee && !currentNeedsExtraFee) {
      total -= 10;
    } else if (!originalHadExtraFee && currentNeedsExtraFee) {
      total += 10;
    }
    this.bookingForm.get('totalPrice')?.setValue(total);
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.notify.errorMessage('Compila tutti i campi richiesti e correggi gli errori.');
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.bookingForm.getRawValue();

    const updateDto = {
      pickupDate: formValue.pickupDate.toISOString(),
      pickupLocation: formValue.pickupLocation._id,
      dropoffDate: formValue.dropoffDate.toISOString(),
      dropoffLocation: formValue.dropoffLocation._id,
      items: formValue.items,
      accessories: formValue.accessories,
      insurances: formValue.insurances,
      totalPrice: formValue.totalPrice,
    };

    this.bookingSrv.updateBooking(this.bookingId, updateDto).pipe(
      takeUntil(this.destroyed$),
      catchError(err => {
        this.notify.errorMessage(err.error?.message || 'Errore durante l\'aggiornamento della prenotazione.');
        console.error('Update error:', err);
        this.isLoading = false;
        return of(null);
      })
    ).subscribe({
      next: (updatedBooking) => {
        if (updatedBooking) {
          this.notify.successMessage('Prenotazione aggiornata con successo!');
          this.router.navigate(['/account']);
        }
        this.isLoading = false;
      }
    });
  }

  cancelEdit(): void {
    this.router.navigate(['/account']);
  }
}
