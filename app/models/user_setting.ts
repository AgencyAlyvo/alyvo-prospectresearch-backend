import { UserSettingSchema } from '#database/schema'

/**
 * Parametres utilisateur (cahier paragraphe 14).
 * Une seule ligne par user (unique userId).
 */
export default class UserSetting extends UserSettingSchema {
  public static table = 'user_settings'
}
