import vine from '@vinejs/vine'

/**
 * Valide les identifiants envoyes par l'application desktop.
 */
export const signInValidator = vine.create({
  email: vine.string().trim().email().normalizeEmail(),
  password: vine.string().trim().minLength(1),
})

/**
 * Valide les informations d'inscription envoyees par l'application desktop.
 */
export const signUpValidator = vine.create({
  email: vine.string().trim().email().normalizeEmail(),
  password: vine.string().trim().minLength(8).confirmed({ as: 'passwordConfirmation' }),
  passwordConfirmation: vine.string().trim(),
})
