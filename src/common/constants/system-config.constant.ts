export const SYSTEM_CONFIG_TYPE = {
  OPEN_DATE: 'OPEN_DATE',
  MAINTENANCE: 'MAINTENANCE'
} as const

export type SystemConfigType =
  (typeof SYSTEM_CONFIG_TYPE)[keyof typeof SYSTEM_CONFIG_TYPE]
