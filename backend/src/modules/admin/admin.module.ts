import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { GeolocationModule } from "../geolocation/geolocation.module";

@Module({
  imports: [GeolocationModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
