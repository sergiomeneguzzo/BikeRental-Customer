import { AbstractControl, ValidationErrors } from '@angular/forms';

export function strongPasswordValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,}$/;
    return password && !passwordPattern.test(password)
      ? { weakPassword: true }
      : null;
  };
}
