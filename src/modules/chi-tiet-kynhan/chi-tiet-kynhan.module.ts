import { Module } from '@nestjs/common'
import { UploadModule } from '@/3rdService/upload/upload.module'
import { ChiTietKyNhanController } from './chi-tiet-kynhan.controller'
import { ChiTietKyNhanRepo } from './chi-tiet-kynhan.repo'
import { ChiTietKyNhanService } from './chi-tiet-kynhan.service'
import { BoiCanhLichSuVaXuatThanModule } from './boi-canh-lich-su-va-xuat-than/boi-canh-lich-su-va-xuat-than.module'
import { SuSachVietGiModule } from './su-sach-viet-gi/su-sach-viet-gi.module'
import { GiaiThoaiDanGianModule } from './giai-thoai-dan-gian/giai-thoai-dan-gian.module'

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
        ChiTietKyNhanRepo
    ],
    exports: [
        ChiTietKyNhanService,
        ChiTietKyNhanRepo
    ]
})
export class ChiTietKyNhanModule { }
