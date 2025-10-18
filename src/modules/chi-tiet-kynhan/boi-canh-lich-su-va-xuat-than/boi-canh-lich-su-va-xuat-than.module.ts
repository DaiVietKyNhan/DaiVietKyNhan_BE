import { Module } from '@nestjs/common'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanController } from './chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.controller'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo } from './chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.repo'
import { ChiTietKyNhanBoiCanhLichSuVaSuuThanService } from './chi-tiet-kynhan-boi-canh-lich-su-va-xuat-than.service'

@Module({
    controllers: [ChiTietKyNhanBoiCanhLichSuVaSuuThanController],
    providers: [
        ChiTietKyNhanBoiCanhLichSuVaSuuThanService,
        ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo
    ],
    exports: [
        ChiTietKyNhanBoiCanhLichSuVaSuuThanService,
        ChiTietKyNhanBoiCanhLichSuVaSuuThanRepo
    ]
})
export class BoiCanhLichSuVaXuatThanModule { }
