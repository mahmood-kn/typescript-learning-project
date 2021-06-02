namespace App {
  export interface Validatable {
    name: string;
    value: string | number;
    requiered?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  export function validate(validateData: Validatable): [boolean, string] {
    let isValid = true;
    let errMsg = '';
    if (validateData.requiered) {
      isValid = isValid && validateData.value.toString().trim().length !== 0;
      errMsg = !isValid ? `${validateData.name} is requiered` : '';
    }
    if (
      validateData.minLength != null &&
      typeof validateData.value === 'string'
    ) {
      isValid = isValid && validateData.value.length >= validateData.minLength;
      errMsg = !isValid
        ? `${validateData.name} Must be between ${validateData.minLength} and ${validateData.maxLength} charecters`
        : '';
    }

    if (
      validateData.maxLength != null &&
      typeof validateData.value === 'string'
    ) {
      isValid = isValid && validateData.value.length <= validateData.maxLength;
      errMsg = !isValid
        ? `${validateData.name} Must be between ${validateData.minLength} and ${validateData.maxLength} charecters`
        : '';
    }

    if (validateData.min != null && typeof validateData.value === 'number') {
      isValid = isValid && validateData.value >= validateData.min;
      errMsg = !isValid
        ? `${validateData.name} Must be between ${validateData.min} and ${validateData.max}`
        : '';
    }
    if (validateData.max != null && typeof validateData.value === 'number') {
      isValid = isValid && validateData.value <= validateData.max;
      errMsg = !isValid
        ? `${validateData.name} Must be between ${validateData.min} and ${validateData.max}`
        : '';
    }
    return [isValid, errMsg];
  }
}
