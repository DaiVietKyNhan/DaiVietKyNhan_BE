import { Module } from '@nestjs/common';
import { KyNhanService } from './kynhan.service';
import { KyNhanController } from './kynhan.controller';
import { KyNhanRepository } from './kynhan.repo';
import { SharedModule } from '../../shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [KyNhanController],
    providers: [KyNhanService, KyNhanRepository],
    exports: [KyNhanService, KyNhanRepository],
})
export class KyNhanModule { }
