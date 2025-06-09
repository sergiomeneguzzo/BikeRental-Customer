import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  successMessage(message: string, duration: number = 3000): void {
    this.openSnackBar(message, 'Chiudi', duration, 'snackbar-success');
  }

  errorMessage(message: string, duration: number = 3000): void {
    this.openSnackBar(message, 'Chiudi', duration, 'snackbar-error');
  }

  warningMessage(message: string, duration: number = 3000): void {
    this.openSnackBar(message, 'Chiudi', duration, 'snackbar-warning');
  }

  private openSnackBar(
    message: string,
    action: string,
    duration: number,
    panelClass: string
  ): void {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: panelClass,
    });
  }
}
