export const BullAction = {
  UPDATE_STATUS_ROLE: 'update-status-role',
  ADD_COIN_TO_USER: 'add-coin-to-user'
} as const

export const BullQueue = {
  USER_DELETION: 'user-deletion',
  SYSTEM_CONFIG: 'system-config',
  ROLE_ACTIVATION: 'role-activation',
  USER_ACTION: 'user-action'
} as const
