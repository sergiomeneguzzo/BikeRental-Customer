import { AbstractControl, ValidationErrors } from '@angular/forms';

export function customEmailValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return control.value && !emailPattern.test(control.value)
      ? { invalidEmail: true }
      : null;
  };
}
