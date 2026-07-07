export const AGE_WARN_DAYS = 3
export const AGE_URGENT_DAYS = 7

/** Days since an item was created (0 for today, null when unknown). */
export const getItemAge = (item, now = new Date()) => {
  if (!item.createdAt) return null
  const created = new Date(item.createdAt)
  if (isNaN(created.getTime())) return null
  const diff = Math.floor(
    (new Date(now.toISOString().split('T')[0]) - new Date(item.createdAt)) /
      86400000
  )
  return Math.max(0, diff)
}

export const getAgeSeverity = (age) => {
  if (age === null) return 'none'
  if (age >= AGE_URGENT_DAYS) return 'urgent'
  if (age >= AGE_WARN_DAYS) return 'warn'
  return 'fresh'
}
