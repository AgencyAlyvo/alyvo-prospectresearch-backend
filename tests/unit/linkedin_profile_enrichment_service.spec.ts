import { test } from '@japa/runner'
import type { Assert } from '@japa/assert'
import LinkedinProfileEnrichmentException from '#exceptions/linkedin_profile_enrichment_exception'
import LinkedinProfileEnrichmentService from '#services/linkedin_profile_enrichment_service'

const linkedinUrl: string = 'https://www.linkedin.com/in/jane-doe/'

/**
 * Remplace fetch global pour les tests unitaires.
 * @param {typeof fetch} mockFetch - Implementation de fetch.
 * @returns {() => void} Restaure fetch apres le test.
 */
const withMockFetch: (mockFetch: typeof fetch) => () => void = (mockFetch: typeof fetch): (() => void) => {
  const originalFetch: typeof fetch = globalThis.fetch
  globalThis.fetch = mockFetch
  return (): void => {
    globalThis.fetch = originalFetch
  }
}

test.group('LinkedinProfileEnrichmentService.enrich', () => {
  test('normalise une reponse n8n valide', async ({ assert }: { assert: Assert }) => {
    const restore: () => void = withMockFetch((): Promise<Response> => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            firstName: 'Jane',
            lastName: 'Doe',
            company: 'Alyvo',
            position: 'CEO',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
    })

    try {
      const result: Awaited<ReturnType<typeof LinkedinProfileEnrichmentService.enrich>> =
        await LinkedinProfileEnrichmentService.enrich(linkedinUrl)

      assert.equal(result.firstName, 'Jane')
      assert.equal(result.lastName, 'Doe')
      assert.equal(result.company, 'Alyvo')
      assert.equal(result.linkedinUrl, linkedinUrl)
    } finally {
      restore()
    }
  })

  test('accepte une reponse n8n imbriquee dans data', async ({ assert }: { assert: Assert }) => {
    const restore: () => void = withMockFetch((): Promise<Response> => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              fullName: 'John Smith',
              headline: 'Directeur commercial',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
    })

    try {
      const result: Awaited<ReturnType<typeof LinkedinProfileEnrichmentService.enrich>> =
        await LinkedinProfileEnrichmentService.enrich(linkedinUrl)

      assert.equal(result.firstName, 'John')
      assert.equal(result.lastName, 'Smith')
      assert.equal(result.position, 'Directeur commercial')
    } finally {
      restore()
    }
  })

  test('retourne 502 quand n8n repond avec une erreur HTTP', async ({ assert }: { assert: Assert }) => {
    const restore: () => void = withMockFetch((): Promise<Response> => {
      return Promise.resolve(new Response('Internal Server Error', { status: 500 }))
    })

    try {
      await LinkedinProfileEnrichmentService.enrich(linkedinUrl)
      assert.fail('Expected LinkedinProfileEnrichmentException')
    } catch (error: unknown) {
      assert.instanceOf(error, LinkedinProfileEnrichmentException)
      assert.equal((error as LinkedinProfileEnrichmentException).status, 502)
      assert.include((error as LinkedinProfileEnrichmentException).message, '500')
    } finally {
      restore()
    }
  })

  test('retourne 502 quand le webhook est injoignable', async ({ assert }: { assert: Assert }) => {
    const restore: () => void = withMockFetch((): Promise<Response> => {
      return Promise.reject(new Error('fetch failed'))
    })

    try {
      await LinkedinProfileEnrichmentService.enrich(linkedinUrl)
      assert.fail('Expected LinkedinProfileEnrichmentException')
    } catch (error: unknown) {
      assert.instanceOf(error, LinkedinProfileEnrichmentException)
      assert.equal((error as LinkedinProfileEnrichmentException).status, 502)
      assert.include((error as LinkedinProfileEnrichmentException).message, 'fetch failed')
    } finally {
      restore()
    }
  })

  test('retourne 422 quand prenom et nom sont absents', async ({ assert }: { assert: Assert }) => {
    const restore: () => void = withMockFetch((): Promise<Response> => {
      return Promise.resolve(
        new Response(JSON.stringify({ company: 'Alyvo' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    try {
      await LinkedinProfileEnrichmentService.enrich(linkedinUrl)
      assert.fail('Expected LinkedinProfileEnrichmentException')
    } catch (error: unknown) {
      assert.instanceOf(error, LinkedinProfileEnrichmentException)
      assert.equal((error as LinkedinProfileEnrichmentException).status, 422)
    } finally {
      restore()
    }
  })
})
