import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { SystemSettingsService } from "./system-settings.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { PermissionGuard } from "../auth/permission.guard";
import { Roles } from "../auth/roles.decorator";
import { Permission } from "../auth/permission.decorator";
import { CurrentUser, CurrentUserData } from "../auth/current-user.decorator";

@Controller("admin/system-settings")
@UseGuards(JwtAuthGuard, AdminGuard, PermissionGuard)
@Roles("admin", "super_admin")
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @Permission("settings.view")
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get(":key")
  @Permission("settings.view")
  async getSetting(@Param("key") key: string) {
    return this.settingsService.getSetting(key);
  }

  @Put()
  @Permission("settings.update")
  async updateMultipleSettings(
    @Body() body: { settings: Record<string, any> },
    @CurrentUser() admin: CurrentUserData,
  ) {
    if (!body.settings || typeof body.settings !== "object") {
      throw new BadRequestException("Corpo deve conter { settings: { key: value, ... } }");
    }
    return this.settingsService.updateMultipleSettings(body.settings, admin.id);
  }

  @Put(":key")
  @Permission("settings.update")
  async updateSetting(
    @Param("key") key: string,
    @Body() body: { value: any },
    @CurrentUser() admin: CurrentUserData,
  ) {
    if (body.value === undefined) {
      throw new BadRequestException("Campo 'value' e obrigatorio");
    }
    return this.settingsService.updateSetting(key, body.value, admin.id);
  }
}
