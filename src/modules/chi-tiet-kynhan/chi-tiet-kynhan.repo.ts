import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'

import { parseQs } from '@/common/utils/qs-parser'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
    CHI_TIET_KY_NHAN_FIELDS,
    ChiTietKyNhanType,
    CreateChiTietKyNhanBodyType,
    UpdateChiTietKyNhanBodyType
} from './entities/chi-tiet-kynhan.entities'

@Injectable()
export class ChiTietKyNhanRepo {
    constructor(private prismaService: PrismaService) { }

    create({
        createdById,
        data
    }: {
        createdById: number | null
        data: CreateChiTietKyNhanBodyType
    }): Promise<ChiTietKyNhanType> {
        return this.prismaService.chiTietKyNhan.create({
            data: {
                ...data,
                createdById
            },
            include: {
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        thoiKy: true,
                        chienCong: true,
                        imgUrl: true,
                        active: true
                    }
                },
                media: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc',
                        createdAt: 'asc'
                    }
                },
                boiCanhLichSuVaSuuThan: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                suSachVietGi: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                giaiThoaiDanGian: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                }
            }
        })
    }

    update({
        id,
        updatedById,
        data
    }: {
        id: number
        updatedById: number
        data: UpdateChiTietKyNhanBodyType
    }): Promise<ChiTietKyNhanType> {
        return this.prismaService.chiTietKyNhan.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                ...data,
                updatedById
            },
            include: {
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        thoiKy: true,
                        chienCong: true,
                        imgUrl: true,
                        active: true
                    }
                },
                media: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc',
                        createdAt: 'asc'
                    }
                },
                boiCanhLichSuVaSuuThan: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                suSachVietGi: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                giaiThoaiDanGian: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                }
            }
        })
    }

    delete(
        {
            id,
            deletedById
        }: {
            id: number
            deletedById: number
        },
        isHard?: boolean
    ): Promise<ChiTietKyNhanType> {
        return isHard
            ? this.prismaService.chiTietKyNhan.delete({
                where: {
                    id
                }
            })
            : this.prismaService.chiTietKyNhan.update({
                where: {
                    id,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date(),
                    deletedById
                },
                include: {
                    kyNhan: {
                        select: {
                            id: true,
                            name: true,
                            thoiKy: true,
                            chienCong: true,
                            imgUrl: true,
                            active: true
                        }
                    },
                    media: true
                }
            })
    }

    async list(pagination: PaginationQueryType) {
        const { where, orderBy } = parseQs(pagination.qs, CHI_TIET_KY_NHAN_FIELDS)

        const skip = (pagination.currentPage - 1) * pagination.pageSize
        const take = pagination.pageSize

        const [totalItems, data] = await Promise.all([
            this.prismaService.chiTietKyNhan.count({
                where: { deletedAt: null, ...where }
            }),
            this.prismaService.chiTietKyNhan.findMany({
                where: { deletedAt: null, ...where },
                include: {
                    kyNhan: {
                        select: {
                            id: true,
                            name: true,
                            thoiKy: true,
                            chienCong: true,
                            imgUrl: true,
                            active: true
                        }
                    },
                    media: {
                        where: {
                            deletedAt: null
                        },
                        orderBy: {
                            thuTu: 'asc',
                            createdAt: 'asc'
                        }
                    },
                    boiCanhLichSuVaSuuThan: {
                        where: {
                            deletedAt: null
                        },
                        orderBy: {
                            thuTu: 'asc'
                        }
                    },
                    suSachVietGi: {
                        where: {
                            deletedAt: null
                        },
                        orderBy: {
                            thuTu: 'asc'
                        }
                    },
                    giaiThoaiDanGian: {
                        where: {
                            deletedAt: null
                        },
                        orderBy: {
                            thuTu: 'asc'
                        }
                    }
                },
                orderBy,
                skip,
                take
            })
        ])

        return {
            results: data,
            pagination: {
                current: pagination.currentPage,
                pageSize: pagination.pageSize,
                totalPage: Math.ceil(totalItems / pagination.pageSize),
                totalItem: totalItems
            }
        }
    }

    findById(id: number): Promise<ChiTietKyNhanType | null> {
        return this.prismaService.chiTietKyNhan.findUnique({
            where: {
                id,
                deletedAt: null
            },
            include: {
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        thoiKy: true,
                        chienCong: true,
                        imgUrl: true,
                        active: true
                    }
                },
                media: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc',
                        createdAt: 'asc'
                    }
                },
                boiCanhLichSuVaSuuThan: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                suSachVietGi: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                giaiThoaiDanGian: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                }
            }
        })
    }

    findByKyNhanId(kyNhanId: number): Promise<ChiTietKyNhanType[]> {
        return this.prismaService.chiTietKyNhan.findMany({
            where: {
                kyNhanId,
                deletedAt: null
            },
            include: {
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        thoiKy: true,
                        chienCong: true,
                        imgUrl: true,
                        active: true
                    }
                },
                media: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc',
                        createdAt: 'asc'
                    }
                },
                boiCanhLichSuVaSuuThan: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                suSachVietGi: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                giaiThoaiDanGian: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        })
    }

    findExistByNameAndKyNhan(ten: string, kyNhanId: number): Promise<ChiTietKyNhanType | null> {
        return this.prismaService.chiTietKyNhan.findFirst({
            where: {
                ten,
                kyNhanId,
                deletedAt: null
            },
            include: {
                kyNhan: {
                    select: {
                        id: true,
                        name: true,
                        thoiKy: true,
                        chienCong: true,
                        imgUrl: true,
                        active: true
                    }
                },
                media: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc',
                        createdAt: 'asc'
                    }
                },
                boiCanhLichSuVaSuuThan: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                suSachVietGi: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                },
                giaiThoaiDanGian: {
                    where: {
                        deletedAt: null
                    },
                    orderBy: {
                        thuTu: 'asc'
                    }
                }
            }
        })
    }
}
