import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
async function main() {
  await prisma.land.createMany({
    data: [
      {
        name: 'Sơn Tinh',
        description:
          'Vùng đất của Sơn Tinh, vị thần núi Tản Viên, biểu trưng cho sức mạnh và ý chí kiên cường chống lại thiên tai.',
        order: 1
      },
      {
        name: 'Chử Đồng Tử',
        description:
          'Vùng đất của Chử Đồng Tử, vị thánh của tình yêu, sự giàu có và là một trong những doanh nhân đầu tiên của Việt Nam.',
        order: 2
      },
      {
        name: 'Thánh Gióng',
        description:
          'Vùng đất của Thánh Gióng, vị anh hùng làng Phù Đổng, biểu trưng cho tinh thần quật khởi chống giặc ngoại xâm.',
        order: 3
      },
      {
        name: 'Liễu Hạnh',
        description:
          'Vùng đất của Thánh Mẫu Liễu Hạnh, một trong Tứ Bất Tử, biểu trưng cho đời sống tinh thần và tín ngưỡng dân gian phong phú.',
        order: 4
      },
      {
        name: 'Bí Ẩn',
        description:
          'Vùng đất bí ẩn chứa đựng những kỳ nhân chưa được khai phá, nơi những huyền thoại mới đang chờ đợi.',
        order: 5
      }
    ],
    skipDuplicates: true
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
