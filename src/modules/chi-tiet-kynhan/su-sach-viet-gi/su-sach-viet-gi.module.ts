import { Module } from '@nestjs/common'
import { ChiTietKyNhanSuSachVietGiController } from './chi-tiet-kynhan-su-sach-viet-gi.controller'
import { ChiTietKyNhanSuSachVietGiRepo } from './chi-tiet-kynhan-su-sach-viet-gi.repo'
import { ChiTietKyNhanSuSachVietGiService } from './chi-tiet-kynhan-su-sach-viet-gi.service'

@Module({
    controllers: [ChiTietKyNhanSuSachVietGiController],
    providers: [
        ChiTietKyNhanSuSachVietGiService,
        ChiTietKyNhanSuSachVietGiRepo
    ],
    exports: [
        ChiTietKyNhanSuSachVietGiService,
        ChiTietKyNhanSuSachVietGiRepo
    ]
})
export class SuSachVietGiModule { }
