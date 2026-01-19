import { Body, Controller, Post, Get, Put, BadRequestException, UseGuards, Request } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { PasswordResetService } from "./password-reset.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Address } from "../users/users.service";
import { ConfigService } from "@nestjs/config";
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ValidateTokenDto,
} from "./dto";

// Função para validar CPF com verificação de dígitos
function isValidCpf(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(10))) return false;

  return true;
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly configService: ConfigService
  ) {}

  // Rate limit: 5 registros por minuto por IP
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 5, ttl: 60000 } })
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

    // Validação de CPF
    if (!isValidCpf(body.cpf)) {
      throw new BadRequestException("CPF inválido");
    }

    if (body.password !== body.passwordConfirmation) {
      throw new BadRequestException("As senhas não conferem");
    }

    // Validação de força de senha: mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
    if (body.password.length < 8) {
      throw new BadRequestException("A senha deve ter pelo menos 8 caracteres");
    }

    if (!/[A-Z]/.test(body.password)) {
      throw new BadRequestException("A senha deve conter pelo menos uma letra maiúscula");
    }

    if (!/[a-z]/.test(body.password)) {
      throw new BadRequestException("A senha deve conter pelo menos uma letra minúscula");
    }

    if (!/[0-9]/.test(body.password)) {
      throw new BadRequestException("A senha deve conter pelo menos um número");
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

  // Rate limit: 5 tentativas de login por minuto por IP (proteção contra brute force)
  @Throttle({ short: { limit: 3, ttl: 1000 }, medium: { limit: 5, ttl: 60000 } })
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

  // Rate limit: 3 solicitações de reset por minuto por IP
  @Throttle({ short: { limit: 1, ttl: 1000 }, medium: { limit: 3, ttl: 60000 } })
  @Post("forgot-password")
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    if (!body.email) {
      throw new BadRequestException("E-mail é obrigatório");
    }

    const result = await this.passwordResetService.createResetToken(body.email);

    // Sempre retorna sucesso para não revelar se o email existe
    if (result) {
      // Aqui você pode integrar com um serviço de email (SendGrid, AWS SES, etc.)
      const frontendUrl = this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";
      const resetUrl = `${frontendUrl}/auth/reset-password?token=${result.token}`;

      // Apenas em desenvolvimento - NUNCA logar dados sensíveis em produção
      if (process.env.NODE_ENV !== "production") {
        console.log("[DEV] Reset URL:", resetUrl);
      }

      // TODO: Enviar email com o link de reset
      // await this.emailService.sendPasswordResetEmail(body.email, result.userName, resetUrl);
    }

    return {
      success: true,
      message: "Se o e-mail existir em nossa base, você receberá instruções para redefinir sua senha.",
    };
  }

  @Post("validate-reset-token")
  async validateResetToken(@Body() body: ValidateTokenDto) {
    if (!body.token) {
      throw new BadRequestException("Token é obrigatório");
    }

    const isValid = await this.passwordResetService.validateResetToken(body.token);

    return {
      valid: !!isValid,
    };
  }

  // Rate limit: 3 resets por minuto por IP
  @Throttle({ short: { limit: 1, ttl: 1000 }, medium: { limit: 3, ttl: 60000 } })
  @Post("reset-password")
  async resetPassword(@Body() body: ResetPasswordDto) {
    if (!body.token || !body.password || !body.passwordConfirmation) {
      throw new BadRequestException("Todos os campos são obrigatórios");
    }

    if (body.password !== body.passwordConfirmation) {
      throw new BadRequestException("As senhas não conferem");
    }

    // Validação de força de senha
    if (body.password.length < 8) {
      throw new BadRequestException("A senha deve ter pelo menos 8 caracteres");
    }

    if (!/[A-Z]/.test(body.password) || !/[a-z]/.test(body.password) || !/[0-9]/.test(body.password)) {
      throw new BadRequestException("A senha deve conter letras maiúsculas, minúsculas e números");
    }

    await this.passwordResetService.resetPassword(body.token, body.password);

    return {
      success: true,
      message: "Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.",
    };
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
