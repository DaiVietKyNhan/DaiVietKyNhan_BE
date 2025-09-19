import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaRepository } from './media.repo';
import { SharedModule } from '../../shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [MediaController],
    providers: [MediaService, MediaRepository],
    exports: [MediaService, MediaRepository],
})
export class MediaModule { }
