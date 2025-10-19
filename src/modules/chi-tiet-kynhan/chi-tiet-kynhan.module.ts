import { Module } from '@nestjs/common'
import { UploadModule } from '@/3rdService/upload/upload.module'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ChiTietKyNhanController } from './chi-tiet-kynhan.controller'
import { ChiTietKyNhanRepo } from './chi-tiet-kynhan.repo'
import { ChiTietKyNhanService } from './chi-tiet-kynhan.service'
import { BoiCanhLichSuVaXuatThanModule } from './boi-canh-lich-su-va-xuat-than/boi-canh-lich-su-va-xuat-than.module'
import { SuSachVietGiModule } from './su-sach-viet-gi/su-sach-viet-gi.module'
import { GiaiThoaiDanGianModule } from './giai-thoai-dan-gian/giai-thoai-dan-gian.module'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo } from './boi-canh-lich-su-va-xuat-than/chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.repo'
import { ChiTietKyNhanSuSachVietGiRepo } from './su-sach-viet-gi/chi-tiet-kynhan-su-sach-viet-gi.repo'
import { ChiTietKyNhanGiaiThoaiDanGianRepo } from './giai-thoai-dan-gian/chi-tiet-kynhan-giai-thoai-dan-gian.repo'
import { MediaRepository } from '../media/media.repo'

@Module({
    imports: [
        UploadModule,
        BoiCanhLichSuVaXuatThanModule,
        SuSachVietGiModule,
        GiaiThoaiDanGianModule
    ],
    controllers: [
        ChiTietKyNhanController
    ],
    providers: [
        ChiTietKyNhanService,
        ChiTietKyNhanRepo,
        PrismaService,
        ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo,
        ChiTietKyNhanSuSachVietGiRepo,
        ChiTietKyNhanGiaiThoaiDanGianRepo,
        MediaRepository
    ],
    exports: [
        ChiTietKyNhanService,
        ChiTietKyNhanRepo
    ]
})
export class ChiTietKyNhanModule { }
