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
import {NotificationService} from '../../services/notification.service';

interface TimeOption { label: string; value: string; }
interface ReservationStep { label: string; }

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
  selectedBikeIds: string[] = [];
  selectedBikes: Bike[] = [];

  locations: Location[] = [];
  bikeTypes: BikeType[] = [];
  filteredBikes: Bike[] = [];
  insurances: Insurance[] = [];
  accessories: Accessory[] = [];
  today: Date = new Date();
  tomorrow: Date = new Date();
  timeOptions: TimeOption[] = [];
  dropoffTimeOptions: TimeOption[] = [];

  bookingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bookingSrv: BookingService,
    private router: Router,
    private notification: NotificationService
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
      pickupDate: [ null, Validators.required ],
      pickupTime: [ null, Validators.required ],
      dropoffDate: [ null, Validators.required ],
      dropoffTime: [ null, Validators.required ],
      extraLocationFee: [false],
      // STEP 2
      bikeType: [null, Validators.required],
      bikeIds: [ [] as string[], Validators.required ],
      //STEP 3
      insuranceId: [null, Validators.required],
      accessories: [ [] ],
      paymentMethod: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.bookingForm.get('dropoffDate')!.disable();
    this.bookingForm.get('dropoffTime')!.disable();
    this.bookingForm.get('pickupDate')!.valueChanges.subscribe(date => {
      if (date) {
        this.bookingForm.get('dropoffDate')!.enable();
      } else {
        this.bookingForm.get('dropoffDate')!.disable();
        this.bookingForm.get('dropoffDate')!.reset();
        this.bookingForm.get('dropoffTime')!.disable();
        this.bookingForm.get('dropoffTime')!.reset();
      }
    });
    this.bookingForm.get('dropoffDate')!.valueChanges.subscribe(date => {
      if (date) {
        this.bookingForm.get('dropoffTime')!.enable();
      } else {
        this.bookingForm.get('dropoffTime')!.disable();
        this.bookingForm.get('dropoffTime')!.reset();
      }
    });

    for (let h = 9; h <= 18; h++) {
      const hh = h.toString().padStart(2, '0');
      this.timeOptions.push({ label: `${hh}:00`, value: `${hh}:00` });
    }
    this.dropoffTimeOptions = [];
    this.today.setHours(0, 0, 0, 0);
    this.tomorrow = new Date(this.today);
    this.tomorrow.setDate(this.today.getDate() + 1);

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
    this.bookingForm.get('pickupTime')!
      .valueChanges
      .subscribe((time: string) => {
        this.bookingForm.get('dropoffTime')!.reset();
        const pickedHour = Number(time.split(':')[0]);
        this.dropoffTimeOptions = this.timeOptions.filter(opt =>
          Number(opt.value.split(':')[0]) > pickedHour
        );
      });
    this.bookingForm.get('pickupDate')?.valueChanges.subscribe((value: Date) => {
      this.pickupDate = value;
      this.resetBikeSelection();
    });
    this.bookingForm.get('dropoffDate')?.valueChanges.subscribe((value: Date) => {
      this.resetBikeSelection();
    });
    this.bookingForm.get('pickupLocation')?.valueChanges.subscribe(() => {
      this.resetBikeSelection();
    });
    this.bookingForm.get('dropoffLocation')?.valueChanges.subscribe(() => {
      this.resetBikeSelection();
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
    return hours > 0 ? Math.ceil(hours / 4) : 0;
  }

  getTotalPrice(bike: Bike): number {
    const hd = this.halfDays;
    const priceHalf = (bike.bikeType as BikeType).PriceHalfDay;

    if (hd >= 1) {
      return priceHalf * hd;
    } else {
      return priceHalf;
    }
  }

  resetBikeSelection(): void {
    this.bookingForm.patchValue({
      bikeType: null,
      bikeIds: []
    });
    this.selectedBikeIds = [];
    this.selectedBikes = [];
    this.filteredBikes = [];
  }

  selectBikeType(typeId: string): void {
    this.bookingForm.patchValue({ bikeType: typeId });
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
          const bt = typeof b.bikeType === 'string' ? b.bikeType : (b.bikeType)._id;
          return bt === typeId;
        });
      });
  }

  addBike(bikeId: string) {
    const bike = this.filteredBikes.find(b => b.id === bikeId);
    if (bike && !this.selectedBikeIds.includes(bikeId)) {
      this.selectedBikeIds.push(bikeId);
      this.selectedBikes.push(bike);
      this.bookingForm.patchValue({ bikeIds: this.selectedBikeIds });
    }
  }

  removeBike(bikeId: string) {
    this.selectedBikeIds = this.selectedBikeIds.filter(id => id !== bikeId);
    this.selectedBikes  = this.selectedBikes.filter(b => b.id !== bikeId);
    this.bookingForm.patchValue({ bikeIds: this.selectedBikeIds });
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
        this.bookingForm.get('pickupTime')!.valid &&
        this.bookingForm.get('dropoffTime')!.valid &&
        this.bookingForm.get('dropoffDate')!.valid;
      return this.isLoggedIn
        ? baseValid
        : baseValid && this.bookingForm.get('guestEmail')!.valid;
    }
    if (index === 1) {
      return this.bookingForm.get('bikeType')!.valid
        && this.bookingForm.get('bikeIds')!.valid
        && this.selectedBikeIds.length > 0;
    }
    if (index === 2) {
      return this.bookingForm.get('insuranceId')!.valid
        && this.bookingForm.get('paymentMethod')!.valid;
    }
    return true;
  }

  getTotalPriceByInsuranceAndAccessories(): number {
    let total = 0;

    this.selectedBikes.forEach(bike => {
      total += this.getTotalPrice(bike);
    });

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

  submit(): void {
    this.loading = true;
    if (this.bookingForm.invalid) {
      return;
    }

    const fv = this.bookingForm.value;

    const puDate: Date = new Date(fv.pickupDate);
    const [puH, puM] = fv.pickupTime
      .split(':')
      .map((n: string) => Number(n));
    puDate.setHours(puH, puM, 0, 0);

    const doDate: Date = new Date(fv.dropoffDate);
    const [doH, doM] = fv.dropoffTime
      .split(':')
      .map((n: string) => Number(n));
    doDate.setHours(doH, doM, 0, 0);

    const extraFee = fv.extraLocationFee ? 10 : 0;

    const totalPrice = this.getTotalPriceByInsuranceAndAccessories();

    const payload: Booking = {
      guestEmail: fv.guestEmail,
      pickupDate: puDate,
      pickupLocation: fv.pickupLocation,
      dropoffDate: doDate,
      dropoffLocation: fv.dropoffLocation,
      items: fv.bikeIds,
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
        this.loading = false;
        if (localStorage.getItem('authToken')) {
          this.notification.successMessage('Prenotazione richiesta con successo!', 3000);
          this.router.navigate(['/booking-confirmed'], {
            queryParams: { id: reservation._id }
          });
        }
        else {
          this.notification.warningMessage('Crea un account per confermare la prenotazione!', 3000);
          this.router.navigate(['/register']);
        }
      },
      error: err => {
        this.loading = false;
        console.error('Errore creazione prenotazione:', err);
        this.notification.errorMessage('Si è verificato un errore durante la prenotazione. Riprova più tardi.', 5000);
      }
    });
  }
}
