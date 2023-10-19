import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  Observable,
  debounceTime,
  delay,
  distinctUntilChanged,
  map,
  of,
} from 'rxjs';

@Component({
  selector: 'app-reactive-form',
  templateUrl: './reactive-form.component.html',
  styleUrls: ['./reactive-form.component.css'],
})
export class ReactiveFormComponent implements OnInit {
  genders = ['male', 'female'];
  forbiddenUsernames: string[] = ['dim', 'kaka'];
  signupForm: FormGroup = {} as FormGroup;

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      userData: new FormGroup({
        username: new FormControl(null, [
          Validators.required,
          this.forbiddenNames.bind(this),
        ]),
        email: new FormControl(
          null,
          [Validators.required, Validators.email],
          this.forbiddenEmailAsyncValidator.bind(this) as AsyncValidatorFn
        ),
      }),
      gender: new FormControl('male'),
      hobbies: new FormArray([]),
    });

    // value changes & status changes hooks to listen to the status and value of the form when they got changed
    // - you can use it for individual control also

    this.signupForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        console.log(value);
      });

    this.signupForm.statusChanges.subscribe((status) => {
      console.log(`status for whole form - ${status}`);
    });

    this.signupForm
      .get('userData.username')
      ?.statusChanges.subscribe((status) => {
        console.log(`status for username control - ${status}`);
      });

    // setValue and patchValue to set the value of a form

    this.signupForm.setValue({
      userData: {
        username: 'user',
        email: 'das2@gmail.com',
      },
      gender: 'male',
      hobbies: [],
    });

    this.signupForm.patchValue({
      userData: {
        username: 'superuser',
      },
    });
  }

  onSubmit() {
    console.log(this.signupForm);
  }

  onAddHobby() {
    const control = new FormControl(null, Validators.required);
    (<FormArray>this.signupForm.get('hobbies')).push(control);
  }

  get hobbyControls() {
    return (this.signupForm.get('hobbies') as FormArray).controls;
  }

  // asynchronous custom validator
  forbiddenEmailAsyncValidator(
    control: FormControl
  ): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        if (control.value === 'das@gmail.com') {
          resolve({ emailIsForbidden: true });
        } else {
          resolve(null);
        }
      }, 1500);
    });

    return promise;
  }

  forbiddenNames(control: FormControl): { [s: string]: boolean } | null {
    if (this.forbiddenUsernames.indexOf(control.value) !== -1) {
      return { nameIsForbidden: true };
    }
    return null;
  }

  getUsernameReuiredErrorStatus(): boolean {
    const requiredStatus = this.signupForm.get('userData.username')?.errors;
    if (requiredStatus != null && requiredStatus['required']) {
      return true;
    }
    return false;
  }

  getUsernameForbiddenErrorStatus(): boolean {
    const requiredStatus = this.signupForm.get('userData.username')?.errors;
    if (requiredStatus != null && requiredStatus['nameIsForbidden']) {
      return true;
    }
    return false;
  }
}
