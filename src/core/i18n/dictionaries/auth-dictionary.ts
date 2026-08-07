export const authEn = {
  "auth.login.email": "Email",
  "auth.login.error": "The email or password is incorrect.",
  "auth.login.password": "Password",
  "auth.login.signIn": "Sign in",
  "auth.login.signingIn": "Signing in...",
  "auth.login.subtitle": "Sign in to manage OMDS operations.",
  "auth.login.title": "Welcome back",
  "auth.signOut": "Sign out",
} as const;

export type AuthTranslationKey = keyof typeof authEn;

export const authEs: Record<AuthTranslationKey, string> = {
  "auth.login.email": "Correo electrónico",
  "auth.login.error": "El correo o la contraseña son incorrectos.",
  "auth.login.password": "Contraseña",
  "auth.login.signIn": "Iniciar sesión",
  "auth.login.signingIn": "Iniciando sesión...",
  "auth.login.subtitle": "Inicia sesión para administrar las operaciones de OMDS.",
  "auth.login.title": "Bienvenido de nuevo",
  "auth.signOut": "Cerrar sesión",
};
