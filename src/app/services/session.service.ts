import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private logoutSubject = new Subject<void>();
  logout$ = this.logoutSubject.asObservable();

  emitLogout(): void {
    this.logoutSubject.next();
  }
}
