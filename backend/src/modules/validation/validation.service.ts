import { Injectable, BadRequestException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { VouchersService } from "../vouchers/vouchers.service";

interface ValidateVoucherInput {
  cpf: string;
  code: string;
}

@Injectable()
export class ValidationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly vouchersService: VouchersService
  ) {}

  validateVoucher(input: ValidateVoucherInput) {
    const user = this.usersService.findByCpf(input.cpf);
    if (!user) {
      throw new BadRequestException("Cliente não encontrado para este CPF");
    }

    const voucherId = Number(input.code);
    if (!Number.isInteger(voucherId) || voucherId <= 0) {
      throw new BadRequestException("Código de voucher inválido");
    }

    const voucher = this.vouchersService.findForUser(user.id, voucherId);

    if (voucher.used) {
      throw new BadRequestException("Voucher já foi utilizado");
    }

    this.vouchersService.useVoucher(user.id, voucher.id);

    return {
      message: "Voucher validado com sucesso",
      voucher: {
        id: voucher.id,
        restaurantName: voucher.restaurantName,
        city: voucher.city
      },
      customer: {
        id: user.id,
        name: user.name,
        cpf: user.cpf
      }
    };
  }

  validateVoucherByCode(code: string) {
    // Extrair ID numérico do código (ex: "ROC-12345" -> 12345 ou "12345" -> 12345)
    const codeMatch = code.replace(/[^0-9]/g, "");
    const voucherId = Number(codeMatch);
    
    if (!Number.isInteger(voucherId) || voucherId <= 0) {
      throw new BadRequestException("Código de voucher inválido");
    }

    // Buscar voucher por ID
    const voucher = this.vouchersService.findById(voucherId);
    
    if (!voucher) {
      throw new BadRequestException("Voucher não encontrado");
    }

    if (voucher.used) {
      throw new BadRequestException("Voucher já foi utilizado");
    }

    // Usar voucher por ID
    this.vouchersService.useVoucherById(voucher.id);

    return {
      valid: true,
      message: "Voucher validado com sucesso",
      voucher: {
        id: voucher.id,
        code: `ROC-${String(voucher.id).padStart(5, "0")}`,
        restaurant: {
          name: voucher.restaurantName,
          city: voucher.city,
          offer: "Desconto válido"
        }
      }
    };
  }
}

