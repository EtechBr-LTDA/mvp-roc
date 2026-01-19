export class AddressDto {
  cep!: string;
  street!: string;
  number!: string;
  complement?: string;
  neighborhood!: string;
  city!: string;
  state!: string;
}

export class RegisterDto {
  name!: string;
  cpf!: string;
  email!: string;
  password!: string;
  passwordConfirmation!: string;
  address?: AddressDto;
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class UpdateProfileDto {
  full_name?: string;
  phone?: string;
  address?: AddressDto;
}

export class ForgotPasswordDto {
  email!: string;
}

export class ResetPasswordDto {
  token!: string;
  password!: string;
  passwordConfirmation!: string;
}

export class ValidateTokenDto {
  token!: string;
}
