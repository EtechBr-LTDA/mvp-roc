import { Injectable, BadRequestException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { VouchersService } from "../vouchers/vouchers.service";

interface ValidateVoucherInput {
  cpf: string;
  code: string;
}

// Função para mascarar CPF (ex: 123.456.789-00 -> ***.456.***-**)
function maskCpf(cpf: string | null): string {
  if (!cpf) return "***.***.***-**";
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11) return "***.***.***-**";
  return `***.${cleanCpf.slice(3, 6)}.***-**`;
}

@Injectable()
export class ValidationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly vouchersService: VouchersService
  ) {}

  async validateVoucher(input: ValidateVoucherInput) {
    const user = await this.usersService.findByCpf(input.cpf);
    if (!user) {
      throw new BadRequestException("Cliente não encontrado para este CPF");
    }

    // Buscar voucher pelo código
    const voucher = await this.vouchersService.findByCode(input.code);

    if (!voucher) {
      throw new BadRequestException("Voucher não encontrado");
    }

    // Verificar se o voucher pertence ao usuário
    if (voucher.profile_id !== user.id) {
      throw new BadRequestException("Este voucher não pertence ao CPF informado");
    }

    if (voucher.status === "used") {
      throw new BadRequestException("Voucher já foi utilizado");
    }

    if (voucher.status === "expired") {
      throw new BadRequestException("Voucher expirado");
    }

    // Marcar voucher como usado
    await this.vouchersService.useVoucherByCode(voucher.code);

    return {
      message: "Voucher validado com sucesso",
      voucher: {
        id: voucher.id,
        code: voucher.code,
        restaurantName: voucher.restaurant.name,
        city: voucher.restaurant.city,
        discountLabel: voucher.restaurant.discount_label,
      },
      customer: {
        name: user.full_name,
        cpf: maskCpf(user.cpf),
      },
    };
  }

  async validateVoucherByCode(code: string) {
    // Normalizar código
    const normalizedCode = code.toUpperCase().trim();

    // Validar formato do código
    if (!normalizedCode.match(/^ROC-[A-Z0-9]{5}$/)) {
      throw new BadRequestException("Formato de código inválido. Use ROC-XXXXX");
    }

    // Buscar voucher por código
    const voucher = await this.vouchersService.findByCode(normalizedCode);

    if (!voucher) {
      throw new BadRequestException("Voucher não encontrado");
    }

    if (voucher.status === "used") {
      throw new BadRequestException("Voucher já foi utilizado");
    }

    if (voucher.status === "expired") {
      throw new BadRequestException("Voucher expirado");
    }

    // Usar voucher
    const usedVoucher = await this.vouchersService.useVoucherByCode(normalizedCode);

    return {
      valid: true,
      message: "Voucher validado com sucesso",
      voucher: {
        id: usedVoucher.id,
        code: usedVoucher.code,
        restaurant: {
          name: usedVoucher.restaurant.name,
          city: usedVoucher.restaurant.city,
          offer: usedVoucher.restaurant.discount_label,
        },
      },
      customer: voucher.profile
        ? {
            name: voucher.profile.full_name,
            cpf: maskCpf(voucher.profile.cpf),
          }
        : null,
    };
  }
}
