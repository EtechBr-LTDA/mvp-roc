import { Controller, Get, Param, Post, Query, UseGuards, BadRequestException } from "@nestjs/common";
import { VouchersService } from "./vouchers.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, CurrentUserData } from "../auth/current-user.decorator";

@Controller("vouchers")
@UseGuards(JwtAuthGuard)
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get()
  async listForCurrentUser(
    @CurrentUser() user: CurrentUserData,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? Math.min(parseInt(limit, 10), 50) : 20; // máximo 50 por página

    const result = await this.vouchersService.listForUser(user.id, {
      page: pageNum,
      limit: limitNum,
    });

    // Formatar resposta para manter compatibilidade com frontend
    return {
      data: result.vouchers.map((voucher) => ({
        id: voucher.id,
        code: voucher.code,
        status: voucher.status,
        used: voucher.status === "used",
        usedAt: voucher.used_at,
        createdAt: voucher.created_at,
        expiresAt: voucher.expires_at,
        restaurantName: voucher.restaurant.name,
        city: voucher.restaurant.city,
        discountLabel: voucher.restaurant.discount_label,
        imageUrl: voucher.restaurant.image_url,
        category: voucher.restaurant.category,
        restaurant: {
          id: voucher.restaurant.id,
          name: voucher.restaurant.name,
          city: voucher.restaurant.city,
          discountLabel: voucher.restaurant.discount_label,
          imageUrl: voucher.restaurant.image_url,
          category: voucher.restaurant.category,
        },
      })),
      pagination: {
        page: result.page,
        limit: limitNum,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(":id")
  async getOne(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    // Validar UUID
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new BadRequestException("ID do voucher inválido");
    }

    const voucher = await this.vouchersService.findForUser(user.id, id);

    return {
      id: voucher.id,
      code: voucher.code,
      status: voucher.status,
      used: voucher.status === "used",
      usedAt: voucher.used_at,
      createdAt: voucher.created_at,
      expiresAt: voucher.expires_at,
      restaurantName: voucher.restaurant.name,
      city: voucher.restaurant.city,
      discountLabel: voucher.restaurant.discount_label,
      imageUrl: voucher.restaurant.image_url,
      category: voucher.restaurant.category,
      restaurant: {
        id: voucher.restaurant.id,
        name: voucher.restaurant.name,
        city: voucher.restaurant.city,
        discountLabel: voucher.restaurant.discount_label,
        imageUrl: voucher.restaurant.image_url,
        category: voucher.restaurant.category,
      },
    };
  }

  @Post(":id/use")
  async use(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    // Validar UUID
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new BadRequestException("ID do voucher inválido");
    }

    const voucher = await this.vouchersService.useVoucher(user.id, id);

    return {
      id: voucher.id,
      code: voucher.code,
      status: voucher.status,
      used: voucher.status === "used",
      usedAt: voucher.used_at,
      restaurantName: voucher.restaurant.name,
      city: voucher.restaurant.city,
      discountLabel: voucher.restaurant.discount_label,
    };
  }
}
