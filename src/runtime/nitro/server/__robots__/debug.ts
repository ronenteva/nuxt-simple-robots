import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getSiteRobotConfig } from '#internal/nuxt-simple-robots'
import { useSiteConfig } from '#internal/nuxt-site-config'

export default defineEventHandler(async (e) => {
  const runtimeConfig = useRuntimeConfig(e)['nuxt-simple-robots']
  const { indexable, hints } = await getSiteRobotConfig(e)
  const siteConfig = useSiteConfig(e)
  const robotsTxt = await e.$fetch('/robots.txt', {
    query: getQuery(e),
  })
  return {
    robotsTxt,
    indexable,
    hints,
    runtimeConfig,
    siteConfig: {
      env: siteConfig.env,
      indexable: siteConfig.indexable,
    },
  }
})
