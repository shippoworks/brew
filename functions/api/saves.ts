interface Env {
  DB: D1Database
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env
  const result = await DB.prepare('SELECT recipe_id, count FROM saves').all()
  const counts: Record<string, number> = {}
  for (const row of result.results) {
    counts[row.recipe_id as string] = row.count as number
  }
  return Response.json({ counts }, {
    headers: { 'Cache-Control': 'no-store' }
  })
}
