export type ShareResult = 'shared' | 'copied' | 'failed'

export async function shareRecipe(
  title: string,
  recipeId: string,
  lang: 'en' | 'ja'
): Promise<ShareResult> {
  const url = `https://brewprotocol.com/recipe/${recipeId}`
  const text = lang === 'ja'
    ? `${title} — コーヒー抽出ガイド`
    : `${title} — Coffee Brewing Guide`

  if (navigator.share) {
    try {
      await navigator.share({ title: 'BREW Protocol', text, url })
      return 'shared'
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        // Fall through to clipboard
      } else {
        return 'failed' // User cancelled
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
