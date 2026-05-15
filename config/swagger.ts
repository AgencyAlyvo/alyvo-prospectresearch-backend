import path from 'node:path'
import url from 'node:url'
import fs from 'fs'
import env from '#start/env'

// Importe le fichier package.json pour récupérer la version en cours du projet
const packageJson: any = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

export default {
  // Chemin de base pour les fichiers swagger qui correspond a la racine du projet
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',

  // Informations générales sur l'API
  info: {
    title: 'SeaTyrants API',
    version: packageJson.version,
    description: 'Documentation Swagger auto-générée.',
  },

  // Index pour organiser les tags
  tagIndex: 1,

  // Options générales
  snakeCase: true, // Convertit automatiquement les noms des chemins en snake_case
  debug: env.get('NODE_ENV') === 'development', // Affiche les logs de débogage pour le développement

  // Routes à ignorer
  ignore: ['/swagger', '/docs', '/'],

  // Méthode préférée si PUT/PATCH sont tous deux définis
  preferredPutPatch: 'PUT',

  // Composants communs
  common: {
    parameters: {},
    headers: {},
    responses: {
      validationError: {
        description: 'Erreur de validation des données (VineJS)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', example: 'email' },
                      message: { type: 'string', example: 'Invalid email format' },
                      rule: { type: 'string', example: 'email' },
                    },
                  },
                },
              },
            },
            example: {
              errors: [
                { field: 'email', message: 'Invalid email format', rule: 'email' },
                { field: 'password', message: 'Password is required', rule: 'required' },
              ],
            },
          },
        },
      },
      badRequest: {
        description: 'Requête invalide (BadRequestException)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'E_BAD_REQUEST' },
                message: { type: 'string', example: 'Invalid code' },
              },
            },
          },
        },
      },
      unauthorized: {
        description: 'Non autorisé (UnauthorizedException)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'E_UNAUTHORIZED' },
                message: { type: 'string', example: 'Unauthorized access' },
              },
            },
          },
        },
      },
      forbidden: {
        description: 'Accès interdit (ForbiddenException)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'E_FORBIDDEN' },
                message: { type: 'string', example: 'Forbidden access' },
              },
            },
          },
        },
      },
      notFound: {
        description: 'Ressource non trouvée (NotFoundException)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'E_NOT_FOUND' },
                message: { type: 'string', example: 'User not found' },
              },
            },
          },
        },
      },
      internalServerError: {
        description: 'Erreur interne du serveur (InternalServerErrorException)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'E_INTERNAL_SERVER_ERROR' },
                message: { type: 'string', example: 'Internal Server Error' },
              },
            },
          },
        },
      },
    },
  },

  // Schémas de sécurité
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
    },
  },
  authMiddlewares: ['health', 'restrictCorsToCrzGames'], // Détection automatique des middlewares
  defaultSecurityScheme: 'BearerAuth', // Schéma par défaut

  // Persist autorisation entre les rechargements dans Swagger UI
  persistAuthorization: true,

  // Options d'affichage
  showFullPath: false, // Affiche les chemins complets après le résumé des endpoints
}
