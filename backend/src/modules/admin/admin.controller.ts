import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser, CurrentUserData } from "../auth/current-user.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
@Roles("admin", "super_admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== DASHBOARD ====================

  @Get("dashboard")
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ==================== USERS ====================

  @Get("users")
  async listUsers(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("status") status?: string
  ) {
    return this.adminService.listUsers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
      search,
      status,
    });
  }

  @Get("users/:id")
  async getUserDetail(@Param("id") id: string) {
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new BadRequestException("ID invalido");
    }
    return this.adminService.getUserDetail(id);
  }

  @Post("users/:id/suspend")
  async suspendUser(
    @Param("id") id: string,
    @CurrentUser() admin: CurrentUserData
  ) {
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new BadRequestException("ID invalido");
    }
    await this.adminService.suspendUser(id, admin.id);
    return { message: "Usuario suspenso com sucesso" };
  }

  @Post("users/:id/activate")
  async activateUser(
    @Param("id") id: string,
    @CurrentUser() admin: CurrentUserData
  ) {
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new BadRequestException("ID invalido");
    }
    await this.adminService.activateUser(id, admin.id);
    return { message: "Usuario ativado com sucesso" };
  }

  // ==================== RESTAURANTS ====================

  @Get("restaurants")
  async listRestaurants(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("active") active?: string
  ) {
    return this.adminService.listRestaurants({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
      search,
      active,
    });
  }

  @Post("restaurants")
  async createRestaurant(
    @Body() body: { name: string; city: string; discount_label: string; image_url?: string; category?: string; description?: string },
    @CurrentUser() admin: CurrentUserData
  ) {
    if (!body.name || !body.city || !body.discount_label) {
      throw new BadRequestException("Nome, cidade e desconto sao obrigatorios");
    }
    return this.adminService.createRestaurant(body, admin.id);
  }

  @Put("restaurants/:id")
  async updateRestaurant(
    @Param("id") id: string,
    @Body() body: { name?: string; city?: string; discount_label?: string; image_url?: string; category?: string; description?: string; active?: boolean },
    @CurrentUser() admin: CurrentUserData
  ) {
    const restaurantId = parseInt(id, 10);
    if (isNaN(restaurantId)) throw new BadRequestException("ID invalido");
    return this.adminService.updateRestaurant(restaurantId, body, admin.id);
  }

  @Patch("restaurants/:id/toggle")
  async toggleRestaurant(
    @Param("id") id: string,
    @CurrentUser() admin: CurrentUserData
  ) {
    const restaurantId = parseInt(id, 10);
    if (isNaN(restaurantId)) throw new BadRequestException("ID invalido");
    return this.adminService.toggleRestaurant(restaurantId, admin.id);
  }

  // ==================== VOUCHERS ====================

  @Get("vouchers")
  async listVouchers(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
    @Query("user_id") userId?: string,
    @Query("restaurant_id") restaurantId?: string,
    @Query("search") search?: string
  ) {
    return this.adminService.listVouchers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
      status,
      user_id: userId,
      restaurant_id: restaurantId,
      search,
    });
  }

  @Post("vouchers/:id/validate")
  async manualValidate(
    @Param("id") id: string,
    @CurrentUser() admin: CurrentUserData
  ) {
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new BadRequestException("ID invalido");
    }
    return this.adminService.manualValidateVoucher(id, admin.id);
  }

  // ==================== AUDIT LOGS ====================

  @Get("audit-logs")
  async getAuditLogs(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("action") action?: string,
    @Query("admin_id") adminId?: string
  ) {
    return this.adminService.getAuditLogs({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
      action,
      admin_id: adminId,
    });
  }
}
