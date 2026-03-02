import type { CollectionAfterChangeHook } from 'payload'

/**
 * Payload hook: fires after any lesson/post/page is saved.
 * Triggers a Cloudflare Pages deploy hook to rebuild the Astro static site.
 *
 * Only fires when status = 'published' or when a previously published
 * document is updated (to unpublish/archive).
 */
export const triggerCloudflareRebuild: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
}) => {
  const deployHookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK

  if (!deployHookUrl) {
    console.warn('[Payload] CLOUDFLARE_DEPLOY_HOOK not set — skipping rebuild trigger')
    return doc
  }

  const isPublished = doc.status === 'published'
  const wasPublished = previousDoc?.status === 'published'

  // Trigger rebuild only when content is published or unpublished
  const shouldRebuild =
    isPublished ||
    wasPublished || // cover the case where we un-publish
    operation === 'create'

  if (!shouldRebuild) {
    return doc
  }

  try {
    const response = await fetch(deployHookUrl, {
      method: 'POST',
    })

    if (response.ok) {
      console.log(`[Payload] Cloudflare Pages rebuild triggered (status: ${response.status})`)
    } else {
      console.error(
        `[Payload] Failed to trigger rebuild: ${response.status} ${response.statusText}`,
      )
    }
  } catch (error) {
    console.error('[Payload] Error triggering Cloudflare rebuild:', error)
  }

  return doc
}
