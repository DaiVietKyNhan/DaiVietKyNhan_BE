import { UserStatus } from '@prisma/client'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
const hashingService = new HashingService()

const createBulkAccounts = async (start: number, end: number) => {
  try {
    console.log(`Starting to create accounts from ${start} to ${end}...`)

    const hashedPassword = await hashingService.hash('123456')

    const accounts: Array<{
      email: string
      password: string
      name: string
      roleId: number
      status: UserStatus
    }> = []
    for (let i = start; i <= end; i++) {
      accounts.push({
        email: `nguoithamgia${i}@gmail.com`,
        password: hashedPassword,
        name: `Người tham gia ${i}`,
        roleId: 2,
        status: UserStatus.ACTIVE
      })
    }

    const result = await prisma.user.createMany({
      data: accounts,
      skipDuplicates: true
    })

    console.log(`Successfully created ${result.count} accounts`)
    console.log(`Accounts created: ${start} to ${end}`)
  } catch (error) {
    console.error('Error creating accounts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get start and end from command line arguments
const args = process.argv.slice(2)
const start = parseInt(args[0]) || 1
const end = parseInt(args[1]) || 100

console.log(`Creating accounts from ${start} to ${end}`)
createBulkAccounts(start, end)
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
