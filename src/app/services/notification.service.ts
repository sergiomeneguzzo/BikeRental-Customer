import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  successMessage(message: string, duration: number = 3000): void {
    this.showMessage('success', 'Successo', message, duration);
  }

  errorMessage(message: string, duration: number = 3000): void {
    this.showMessage('error', 'Errore', message, duration);
  }

  warningMessage(message: string, duration: number = 3000): void {
    this.showMessage('warn', 'Attenzione', message, duration);
  }

  private showMessage(severity: string, summary: string, detail: string, life: number): void {
    this.messageService.add({ severity, summary, detail, life });
  }
}
