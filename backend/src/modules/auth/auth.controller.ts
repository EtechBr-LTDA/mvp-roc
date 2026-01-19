import { Body, Controller, Post, Get, Put, BadRequestException, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Address } from "../users/users.service";

class AddressDto {
  cep!: string;
  street!: string;
  number!: string;
  complement?: string;
  neighborhood!: string;
  city!: string;
  state!: string;
}

class RegisterDto {
  name!: string;
  cpf!: string;
  email!: string;
  password!: string;
  passwordConfirmation!: string;
  address?: AddressDto;
}

class LoginDto {
  email!: string;
  password!: string;
}

class UpdateProfileDto {
  full_name?: string;
  phone?: string;
  address?: AddressDto;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterDto) {
    if (
      !body.name ||
      !body.cpf ||
      !body.email ||
      !body.password ||
      !body.passwordConfirmation
    ) {
      throw new BadRequestException("Todos os campos são obrigatórios");
    }

    if (body.password !== body.passwordConfirmation) {
      throw new BadRequestException("As senhas não conferem");
    }

    if (body.password.length < 6) {
      throw new BadRequestException("A senha deve ter pelo menos 6 caracteres");
    }

    // Validar endereço se fornecido
    let address: Address | undefined;
    if (body.address) {
      if (!body.address.cep || !body.address.street || !body.address.number ||
          !body.address.neighborhood || !body.address.city || !body.address.state) {
        throw new BadRequestException("Endereço incompleto");
      }
      address = body.address;
    }

    try {
      return await this.authService.register({
        name: body.name,
        cpf: body.cpf,
        email: body.email,
        password: body.password,
        address,
      });
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw new BadRequestException(error.message || "Erro ao criar conta");
    }
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    if (!body.email || !body.password) {
      throw new BadRequestException("E-mail e senha são obrigatórios");
    }

    return this.authService.login({
      email: body.email,
      password: body.password,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put("profile")
  async updateProfile(@Request() req: any, @Body() body: UpdateProfileDto) {
    // Validar endereço se fornecido
    let address: Address | undefined;
    if (body.address) {
      if (!body.address.cep || !body.address.street || !body.address.number ||
          !body.address.neighborhood || !body.address.city || !body.address.state) {
        throw new BadRequestException("Endereço incompleto");
      }
      address = body.address;
    }

    return this.authService.updateProfile(req.user.id, {
      full_name: body.full_name,
      phone: body.phone,
      address,
    });
  }
}
