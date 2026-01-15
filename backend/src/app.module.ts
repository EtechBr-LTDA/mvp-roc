import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { RestaurantsModule } from "./modules/restaurants/restaurants.module";
import { VouchersModule } from "./modules/vouchers/vouchers.module";
import { ValidationModule } from "./modules/validation/validation.module";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CampaignsModule,
    RestaurantsModule,
    VouchersModule,
    ValidationModule
  ]
})
export class AppModule {}

