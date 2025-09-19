import { Module } from '@nestjs/common';
import { ChiTietKyNhanService } from './chitietkynhan.service';
import { ChiTietKyNhanController } from './chitietkynhan.controller';
import { ChiTietKyNhanRepository } from './chitietkynhan.repo';
import { SharedModule } from '../../shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [ChiTietKyNhanController],
    providers: [ChiTietKyNhanService, ChiTietKyNhanRepository],
    exports: [ChiTietKyNhanService, ChiTietKyNhanRepository],
})
export class ChiTietKyNhanModule { }
