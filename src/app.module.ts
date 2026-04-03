import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BuyersModule } from './buyers/buyers.module';
import { SalesModule } from './sales/sales.module';
import { EmployeesModule } from './employees/employees.module';
import { FeedBagsModule } from './feed-bags/feed-bags.module';
import { CartonsModule } from './cartons/cartons.module';

@Module({
  imports: [PrismaModule, AuthModule, BuyersModule, SalesModule, EmployeesModule, FeedBagsModule, CartonsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
