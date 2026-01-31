import { Module } from "@nestjs/common";
import { GeolocationService } from "./geolocation.service";
import { IpwhoisService } from "./ipwhois.service";

@Module({
  providers: [GeolocationService, IpwhoisService],
  exports: [GeolocationService],
})
export class GeolocationModule {}
