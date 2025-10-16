export const UserLandStatus = {
  LOCKED_FORCED: 'LOCKED_FORCED',
  LOCKED: 'LOCKED',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED'
} as const
export type UserLandStatusType = (typeof UserLandStatus)[keyof typeof UserLandStatus]
