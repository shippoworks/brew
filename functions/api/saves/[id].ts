interface Env {
  DB: D1Database
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env
  const id = context.params.id as string
  const body = await context.request.json() as { action: 'increment' | 'decrement' }

  if (body.action === 'increment') {
    await DB.prepare(
      `INSERT INTO saves (recipe_id, count) VALUES (?, 1)
       ON CONFLICT(recipe_id) DO UPDATE SET count = count + 1`
    ).bind(id).run()
  } else {
    await DB.prepare(
      `UPDATE saves SET count = MAX(0, count - 1) WHERE recipe_id = ?`
    ).bind(id).run()
  }

  const row = await DB.prepare('SELECT count FROM saves WHERE recipe_id = ?').bind(id).first()
  return Response.json({ count: (row?.count as number) ?? 0 })
}
