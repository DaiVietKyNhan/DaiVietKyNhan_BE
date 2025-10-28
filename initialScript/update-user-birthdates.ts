import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Random một số nguyên từ min đến max (bao gồm cả min và max)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Random một ngày sinh từ năm 1995 đến 2005
 */
function randomBirthDate(): Date {
  const year = randomInt(1995, 2005)
  const month = randomInt(1, 12)

  // Số ngày trong tháng (đơn giản hóa, không tính năm nhuận)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const maxDay = daysInMonth[month - 1]

  // Xử lý năm nhuận cho tháng 2
  if (month === 2 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    const day = randomInt(1, 29)
    return new Date(year, month - 1, day)
  }

  const day = randomInt(1, maxDay)
  return new Date(year, month - 1, day)
}

async function updateUserBirthdates() {
  try {
    console.log('🚀 Starting to update user birthdates...')

    // Lấy tất cả user có birthDate = null
    const usersWithoutBirthdate = await prisma.user.findMany({
      where: {
        birthDate: null,
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (usersWithoutBirthdate.length === 0) {
      console.log('✅ No users found with null birthDate. Nothing to update.')
      return
    }

    console.log(`📊 Found ${usersWithoutBirthdate.length} users without birthDate`)

    let successCount = 0
    let errorCount = 0

    // Update từng user
    for (const user of usersWithoutBirthdate) {
      try {
        const randomDate = randomBirthDate()

        await prisma.user.update({
          where: { id: user.id },
          data: { birthDate: randomDate }
        })

        console.log(
          `✓ Updated user ${user.id} (${user.email}): ${randomDate.toISOString().split('T')[0]}`
        )
        successCount++
      } catch (error) {
        console.error(`✗ Failed to update user ${user.id} (${user.email}):`, error)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Update completed!`)
    console.log(`   - Total users: ${usersWithoutBirthdate.length}`)
    console.log(`   - Success: ${successCount}`)
    console.log(`   - Failed: ${errorCount}`)
    console.log('='.repeat(50))
  } catch (error) {
    console.error('❌ Error updating user birthdates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Chạy script
updateUserBirthdates()
  .then(() => {
    console.log('✨ Script execution finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script execution failed:', error)
    process.exit(1)
  })
