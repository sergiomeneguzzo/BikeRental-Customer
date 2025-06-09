import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {BookingService} from '../../services/booking.service';
import {Location} from '../../interfaces/location';
import {Bike, BikeStatus, BikeType} from '../../interfaces/bike';
import {Accessory} from '../../interfaces/accessories';
import {Insurance} from '../../interfaces/insurance';

interface ReservationStep {
  label: string;
}

export type PaymentMethod = 'onPickup' | 'paypal' | 'card';

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit{
  steps: ReservationStep[] = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
  ];
  activeIndex = 0;

  locations: Location[] = [];
  bikeTypes: BikeType[] = [];
  filteredBikes: Bike[] = [];
  insurances: Insurance[] = [];
  accessories: Accessory[] = [];

  bookingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bookingSrv: BookingService
  ) {
    this.bookingForm = this.fb.group({
      // STEP 1
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
    this.bookingSrv.getLocations().subscribe(locs => this.locations = locs);
    this.bookingSrv.getBikeTypes().subscribe(types => this.bikeTypes = types);
    this.bookingSrv.getInsurances().subscribe(list => {this.insurances = list;});
    this.bookingSrv.getAccessories().subscribe(list => {this.accessories = list;});

    this.bookingForm.get('pickupLocation')!.valueChanges.subscribe(() => this.updateExtraFee());
    this.bookingForm.get('dropoffLocation')!.valueChanges.subscribe(() => this.updateExtraFee());
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

  updateExtraFee(): void {
    const pu = this.bookingForm.get('pickupLocation')!.value;
    const doff = this.bookingForm.get('dropoffLocation')!.value;
    const extra = pu && doff && pu !== doff;
    this.bookingForm.patchValue({ extraLocationFee: extra }, { emitEvent: false });
  }

  selectBikeType(typeId: string): void {
    this.bookingForm.patchValue({ bikeType: typeId, bikeId: null });
    this.bookingSrv.getBikes().subscribe(all => {
      this.filteredBikes = all.filter(b => {
        const bt = typeof b.bikeType === 'string' ? b.bikeType : (b.bikeType as any)._id;
        return bt === typeId && b.status === BikeStatus.AVAILABLE;
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

  submit(): void {
    if (this.bookingForm.valid) {
      console.log('Booking payload:', this.bookingForm.value);
    }
  }

  public isStepValid(index: number): boolean {
    if (index === 0) {
      return this.bookingForm.get('pickupLocation')!.valid
        && this.bookingForm.get('dropoffLocation')!.valid
        && this.bookingForm.get('pickupDate')!.valid
        && this.bookingForm.get('dropoffDate')!.valid;
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

  protected readonly Object = Object;
}
