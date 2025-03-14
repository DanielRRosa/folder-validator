export type ValidationOptions = {
  strict?: boolean;
  allowUnknown?: boolean;
  ignoreCase?: boolean;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};
