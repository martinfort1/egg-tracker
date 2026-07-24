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
import { VaccinesModule } from './vaccines/vaccines.module';
import { ExpensesModule } from './expenses/expenses.module';
import { EggLayingModule } from './egg-laying/egg-laying.module';
import { ChickensModule } from './chickens/chickens.module';
import { SupportModule } from './support/support.module';
import { FeatureSuggestionModule } from './feature-suggestion/feature-suggestion.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [PrismaModule, AuthModule, BuyersModule, SalesModule, EmployeesModule, FeedBagsModule, CartonsModule, VaccinesModule, ExpensesModule, EggLayingModule, ChickensModule, SupportModule, FeatureSuggestionModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
