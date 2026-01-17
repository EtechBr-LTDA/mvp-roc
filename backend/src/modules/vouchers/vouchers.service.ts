import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { UsersService } from "../users/users.service";

export interface Voucher {
  id: number;
  userId: number;
  restaurantName: string;
  city: string;
  used: boolean;
  usedAt?: Date;
}

@Injectable()
export class VouchersService {
  private vouchers: Voucher[] = [];
  private nextId = 1;

  constructor(private readonly usersService: UsersService) {}

  generateVouchersForUser(userId: number) {
    const user = this.usersService.findById(userId);

    const existing = this.vouchers.filter((voucher) => voucher.userId === user.id);
    if (existing.length > 0) {
      return existing;
    }

    const created: Voucher[] = new Array(25).fill(null).map((_, index) => {
      const id = this.nextId++;
      const city = index % 5 === 0 ? "Porto Velho" : "Outra cidade";

      return {
        id,
        userId: user.id,
        restaurantName: `Restaurante ${index + 1}`,
        city,
        used: false
      };
    });

    this.vouchers.push(...created);
    return created;
  }

  listForUser(userId: number): Voucher[] {
    this.usersService.findById(userId);
    const userVouchers = this.vouchers.filter((voucher) => voucher.userId === userId);
    if (userVouchers.length === 0) {
      return this.generateVouchersForUser(userId);
    }
    return userVouchers;
  }

  findForUser(userId: number, voucherId: number): Voucher {
    this.usersService.findById(userId);
    const voucher = this.vouchers.find(
      (v) => v.userId === userId && v.id === voucherId
    );

    if (!voucher) {
      throw new NotFoundException("Voucher não encontrado");
    }

    return voucher;
  }

  findById(voucherId: number): Voucher | null {
    const voucher = this.vouchers.find((v) => v.id === voucherId);
    return voucher || null;
  }

  useVoucher(userId: number, voucherId: number): Voucher {
    const voucher = this.findForUser(userId, voucherId);

    if (voucher.used) {
      throw new BadRequestException("Voucher já utilizado");
    }

    voucher.used = true;
    voucher.usedAt = new Date();

    return voucher;
  }

  useVoucherById(voucherId: number): Voucher {
    const voucher = this.findById(voucherId);
    
    if (!voucher) {
      throw new NotFoundException("Voucher não encontrado");
    }

    if (voucher.used) {
      throw new BadRequestException("Voucher já utilizado");
    }

    voucher.used = true;
    voucher.usedAt = new Date();

    return voucher;
  }
}

