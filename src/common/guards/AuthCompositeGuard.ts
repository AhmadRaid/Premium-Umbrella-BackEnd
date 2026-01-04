import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';
import { JwtAuthAdminGuard } from 'src/common/guards/jwtAuthAdminGuard';

@Injectable()
export class AuthCompositeGuard implements CanActivate {
  constructor(private moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // جلب الـ Guards ديناميكياً من المودول
    const jwtGuard = this.moduleRef.get(JwtAuthGuard, { strict: false });
    const adminGuard = this.moduleRef.get(JwtAuthAdminGuard, { strict: false });

    const results = await Promise.allSettled([
      jwtGuard.canActivate(context),
      adminGuard.canActivate(context),
    ]);

    return results.some(
      (result) => result.status === 'fulfilled' && result.value === true,
    );
  }
}