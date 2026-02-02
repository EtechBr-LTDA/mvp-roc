import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { StatsService } from "./stats.service";
import { AdminController } from "./admin.controller";
import { GeolocationModule } from "../geolocation/geolocation.module";

@Module({
  imports: [GeolocationModule],
  providers: [AdminService, StatsService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
