import { Module } from '@nestjs/common'

import { UploadModule } from '@/3rdService/upload/upload.module'
import { PrismaService } from 'src/shared/services/prisma.service'
import { KynhanController } from './kynhan.controller'
import { KynhanRepo } from './kynhan.repo'
import { KynhanService } from './kynhan.service'
import { ChiTietKyNhanRepo } from '../chi-tiet-kynhan/chi-tiet-kynhan.repo'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo } from '../chi-tiet-kynhan/boi-canh-lich-su-va-xuat-than/chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.repo'
import { ChiTietKyNhanSuSachVietGiRepo } from '../chi-tiet-kynhan/su-sach-viet-gi/chi-tiet-kynhan-su-sach-viet-gi.repo'
import { ChiTietKyNhanGiaiThoaiDanGianRepo } from '../chi-tiet-kynhan/giai-thoai-dan-gian/chi-tiet-kynhan-giai-thoai-dan-gian.repo'
import { MediaRepository } from '../media/media.repo'

@Module({
  imports: [UploadModule],
  controllers: [KynhanController],
  providers: [
    KynhanService,
    KynhanRepo,
    PrismaService,
    ChiTietKyNhanRepo,
    ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo,
    ChiTietKyNhanSuSachVietGiRepo,
    ChiTietKyNhanGiaiThoaiDanGianRepo,
    MediaRepository
  ],
  exports: [KynhanService, KynhanRepo]
})
export class KyNhanModule { }
