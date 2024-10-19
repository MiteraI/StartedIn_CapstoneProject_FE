import { MaskitoOptions } from '@maskito/core';

export const phoneMask: MaskitoOptions = {
  mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
};
