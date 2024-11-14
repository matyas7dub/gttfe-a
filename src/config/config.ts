export const publicUrl = process.env.PUBLIC_URL ?? "/"
export const loginPathRelative = (process.env.REACT_APP_AUTH_REDIRECT ?? '/login')
export const loginPath = `${publicUrl}${loginPathRelative}`
export const backendUrl = (process.env.REACT_APP_BACKEND_URL ?? "")
export const horizontalFormSpacing = "2rem"
