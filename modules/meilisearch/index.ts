import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, addPlugin, addServerHandler } from '@nuxt/kit'
import { defu } from 'defu'
import type { InstantMeiliSearchOptions } from '@meilisearch/instant-meilisearch'

interface ModuleOptions {
  enabled: boolean
  host: string
  searchApiKey: string
  options?: InstantMeiliSearchOptions
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'meilisearch'
  },
  defaults: {
    enabled: process.env.MEILISEARCH_ENABLED || true,
    host: process.env.MEILISEARCH_HOST || '',
    searchApiKey: process.env.MEILISEARCH_SEARCH_API_KEY || ''
  },
  setup (resolvedOptions, nuxtApp) {
    if (!resolvedOptions.enabled) {
      console.log('`[Meilisearch]` Module is not enabled')
      return
    }

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    if (!resolvedOptions.host) {
      throw new Error('`[Meilisearch]` Missing `host`')
    }
    if (!resolvedOptions.searchApiKey) {
      throw new Error('`[Meilisearch]` Missing `searchApiKey`')
    }

    nuxtApp.options.runtimeConfig.public.meilisearch = defu(nuxtApp.options.runtimeConfig.meilisearch, {
      host: resolvedOptions.host,
      searchApiKey: resolvedOptions.searchApiKey,
      options: resolvedOptions.options
    })

    addPlugin(resolve(runtimeDir, 'plugin'))

    nuxtApp.hook('imports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })

    addServerHandler({
      middleware: true,
      handler: resolve(runtimeDir, 'server/middleware/createInstantMeilisearch')
    })
  }
})
