import { Module } from '@nestjs/common'
import { ChiTietKyNhanGiaiThoaiDanGianController } from './chi-tiet-kynhan-giai-thoai-dan-gian.controller'
import { ChiTietKyNhanGiaiThoaiDanGianRepo } from './chi-tiet-kynhan-giai-thoai-dan-gian.repo'
import { ChiTietKyNhanGiaiThoaiDanGianService } from './chi-tiet-kynhan-giai-thoai-dan-gian.service'

@Module({
    controllers: [ChiTietKyNhanGiaiThoaiDanGianController],
    providers: [
        ChiTietKyNhanGiaiThoaiDanGianService,
        ChiTietKyNhanGiaiThoaiDanGianRepo
    ],
    exports: [
        ChiTietKyNhanGiaiThoaiDanGianService,
        ChiTietKyNhanGiaiThoaiDanGianRepo
    ]
})
export class GiaiThoaiDanGianModule { }
