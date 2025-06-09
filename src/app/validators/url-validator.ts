import { AbstractControl, ValidationErrors } from '@angular/forms';

export function urlValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const urlPattern = /^(http|https):\/\/[^ "]+$/;
    return control.value && !urlPattern.test(control.value)
      ? { invalidUrl: true }
      : null;
  };
}
