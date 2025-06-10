import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {BookingService} from '../../services/booking.service';
import {Location} from '../../interfaces/location';
import {Bike, BikeStatus, BikeType} from '../../interfaces/bike';
import {Accessory} from '../../interfaces/accessories';
import {Insurance} from '../../interfaces/insurance';
import {Booking} from '../../interfaces/booking';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import { delay, finalize } from 'rxjs/operators';

interface ReservationStep {
  label: string;
}

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BookingComponent implements OnInit{
  isLoggedIn = !!localStorage.getItem('authToken');
  loading = true;

  steps: ReservationStep[] = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
  ];
  activeIndex = 0;
  pickupDate: Date | null = null;

  locations: Location[] = [];
  bikeTypes: BikeType[] = [];
  filteredBikes: Bike[] = [];
  insurances: Insurance[] = [];
  accessories: Accessory[] = [];

  bookingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bookingSrv: BookingService,
    private router: Router
  ) {
    this.bookingForm = this.fb.group({
      // STEP 1
      guestEmail: [
        null,
        this.isLoggedIn
          ? []
          : [Validators.required, Validators.email]
      ],
      pickupLocation: [null, Validators.required],
      dropoffLocation: [null, Validators.required],
      pickupDate: [null, Validators.required],
      dropoffDate: [null, Validators.required],
      extraLocationFee: [false],
      // STEP 2
      bikeType: [null, Validators.required],
      bikeId: [null, Validators.required],
      //STEP 3
      insuranceId: [null, Validators.required],
      accessories: [ [] ],
      paymentMethod: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    forkJoin({
      locs: this.bookingSrv.getLocations(),
      types: this.bookingSrv.getBikeTypes(),
      ins: this.bookingSrv.getInsurances(),
      accs: this.bookingSrv.getAccessories()
    })
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: ({ locs, types, ins, accs }) => {
          this.locations = locs;
          this.bikeTypes = types;
          this.insurances = ins;
          this.accessories = accs;
        },
        error: err => {
          console.error('Errore caricamento dati:', err);
        }
      });
    this.bookingForm.get('pickupDate')?.valueChanges.subscribe((value: Date) => {
      this.pickupDate = value;
    });
    this.bookingForm.get('pickupLocation')?.valueChanges.subscribe(() => {
    });
    this.bookingForm.get('dropoffLocation')?.valueChanges.subscribe(() => {
    });
  }

  get halfDays(): number {
    const pu: Date = this.bookingForm.get('pickupDate')!.value;
    const doff: Date = this.bookingForm.get('dropoffDate')!.value;
    if (!pu || !doff) {
      return 0;
    }
    const msDiff = doff.getTime() - pu.getTime();
    const hours = msDiff / (1000 * 60 * 60);
    return hours > 0 ? Math.ceil(hours / 12) : 0;
  }

  getTotalPrice(bike: Bike): number {
    if (this.halfDays === 0) {
      return 0;
    }
    const priceHalf = (bike.bikeType as BikeType).PriceHalfDay;
    return priceHalf * this.halfDays;
  }

  selectBikeType(typeId: string): void {
    this.bookingForm.patchValue({ bikeType: typeId, bikeId: null });
    const locId = this.bookingForm.value.pickupLocation;
    const pu    = this.bookingForm.value.pickupDate;
    const doff  = this.bookingForm.value.dropoffDate;
    if (!locId || !pu || !doff) {
      this.filteredBikes = [];
      return;
    }
    this.bookingSrv
      .getBikes(locId, pu, doff)
      .subscribe(all => {
        this.filteredBikes = all.filter(b => {
          const bt = typeof b.bikeType === 'string' ? b.bikeType : (b.bikeType as any)._id;
          return bt === typeId;
        });
      });
  }

  next() {
    if (this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
    }
  }

  prev() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  public isStepValid(index: number): boolean {
    if (index === 0) {
      const baseValid =
        this.bookingForm.get('pickupLocation')!.valid &&
        this.bookingForm.get('dropoffLocation')!.valid &&
        this.bookingForm.get('pickupDate')!.valid &&
        this.bookingForm.get('dropoffDate')!.valid;
      return this.isLoggedIn
        ? baseValid
        : baseValid && this.bookingForm.get('guestEmail')!.valid;
    }
    if (index === 1) {
      return this.bookingForm.get('bikeType')!.valid
        && this.bookingForm.get('bikeId')!.valid;
    }
    if (index === 2) {
      return this.bookingForm.get('insuranceId')!.valid
        && this.bookingForm.get('paymentMethod')!.valid;
    }
    return true;
  }

  selectBike(bikeId: string) {
    this.bookingForm.patchValue({ bikeId });
  }

  deselectBike() {
    this.bookingForm.patchValue({ bikeId: null });
  }

  getTotalPriceByInsuranceAndAccessories(): number {
    let total = 0;

    const bike = this.filteredBikes.find(b => b.id === this.bookingForm.value.bikeId);
    if (bike) {
      total += this.getTotalPrice(bike);
    }
    const insId = this.bookingForm.value.insuranceId;
    const ins = this.insurances.find(i => i._id === insId);
    if (ins) {
      total += ins.price;
    }

    const accIds: string[] = this.bookingForm.value.accessories || [];
    accIds.forEach(id => {
      const a = this.accessories.find(ac => ac._id === id);
      if (a) total += a.price;
    });
    const extraLocationFee = this.bookingForm.get('extraLocationFee')?.value;
    if (extraLocationFee) {
      total += 10;
    }
    return total;
  }

  getStatusText(status: BikeStatus): string {
    switch (status) {
      case BikeStatus.AVAILABLE:
        return 'Disponibile';
      case BikeStatus.RENTED:
        return 'Noleggiata';
      case BikeStatus.MAINTENANCE:
        return 'In manutenzione';
      case BikeStatus.UNAVAILABLE:
        return 'Non disponibile';
      default:
        return 'Stato sconosciuto';
    }
  }

  onDateSelect(selectedDate: Date, type: 'pickup' | 'dropoff'): void {
    if (selectedDate) {
      this.normalizeToHourOnly(selectedDate, type);
    }
  }

  onDateInput(event: any, type: 'pickup' | 'dropoff'): void {
    const inputDate = event.target.value;
    if (inputDate) {
      const date = new Date(inputDate);
      if (!isNaN(date.getTime())) {
        this.normalizeToHourOnly(date, type);
      }
    }
  }

  private normalizeToHourOnly(date: Date, type: 'pickup' | 'dropoff'): void {
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    if (type === 'pickup') {
      this.bookingForm.patchValue({ pickupDate: new Date(date) });
    } else {
      this.bookingForm.patchValue({ dropoffDate: new Date(date) });
    }
  }

  submit(): void {
    if (this.bookingForm.invalid) {
      return;
    }

    const fv = this.bookingForm.value;

    const extraFee = fv.extraLocationFee ? 10 : 0;

    const totalPrice = this.getTotalPriceByInsuranceAndAccessories();

    const payload: Booking = {
      guestEmail: fv.guestEmail,
      pickupDate: fv.pickupDate,
      pickupLocation: fv.pickupLocation,
      dropoffDate: fv.dropoffDate,
      dropoffLocation: fv.dropoffLocation,
      items: [fv.bikeId],
      accessories: fv.accessories,
      insurances: [fv.insuranceId],
      extraLocationFee: extraFee,
      totalPrice: totalPrice,
      reminderSent: false,
      paymentMethod: fv.paymentMethod
    };

    console.log('Payload reservation:', payload);
    this.bookingSrv.createReservation(payload).subscribe({
      next: reservation => {
        if (localStorage.getItem('authToken')) {
          this.router.navigate(['/booking-confirmed'], {
            queryParams: { id: reservation.id }
          });
        }
        else {
          this.router.navigate(['/register']);
        }
      },
      error: err => {
        console.error('Errore creazione prenotazione:', err);
      }
    });
  }

  protected readonly Object = Object;
}
