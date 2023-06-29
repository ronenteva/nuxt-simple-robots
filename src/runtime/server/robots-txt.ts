import { defineEventHandler, setHeader } from 'h3'
import { withBase } from 'ufo'
import { generateRobotsTxt } from '../robotsTxt/generateRobotsTxt'
import { useNitroApp } from '#internal/nitro'
import { useNitroOrigin, useRuntimeConfig, useSiteConfig } from '#imports'
import type { RobotsGroupResolved } from '~/src/types'

export default defineEventHandler(async (e) => {
  setHeader(e, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(e, 'Cache-Control', process.dev ? 'no-store' : 'max-age=14400, must-revalidate')

  const { groups, sitemap, credits } = useRuntimeConfig()['nuxt-simple-robots']
  const { url, indexable } = useSiteConfig(e)
  // in dev we serve the sitemap with localhost paths so can click into it
  const siteUrl = withBase(process.dev ? useNitroOrigin(e) : (url || useNitroOrigin(e)), useRuntimeConfig().app.baseURL)

  let sitemaps: string[] = [...(Array.isArray(sitemap) ? sitemap : [sitemap])]
    // validate sitemaps are absolute
    .map((s) => {
      // ensure base
      if (!s.startsWith('http'))
        return withBase(s, siteUrl)
      return s
    })

  let robotGroups: RobotsGroupResolved[] = [...groups]
  if (!indexable) {
    robotGroups = [
      {
        userAgent: ['*'],
        disallow: ['/'],
      },
    ]
    sitemaps = [] // no point adding sitemaps if not indexable
  }

  let robotsTxt: string = generateRobotsTxt({ groups: robotGroups, sitemaps })
  if (credits) {
    robotsTxt = [
      `# START nuxt-simple-robots (${process.dev ? 'dev mode - ' : ''}${indexable ? 'indexable' : 'indexing disabled'})`,
      robotsTxt,
      '# END nuxt-simple-robots',
    ].join('\n')
  }

  const hookCtx = { robotsTxt }
  const nitro = useNitroApp()
  await nitro.hooks.callHook('robots:robots-txt', hookCtx)
  return hookCtx.robotsTxt
})