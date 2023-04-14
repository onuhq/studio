// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Execution } from '@/types'
import cache from '@/lib/db';
import jsonTasks from '../../../../tasks.json'


type Data = {
  execution: Execution | null,
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { eid } = req.query

  const executions: Execution[] = await cache.get('executions') || []

  const execution = executions.find((e) => e.eid === eid) || null
  const task = jsonTasks.find((t: any) => t.slug === execution?.taskSlug) || null

  if (task && execution) {
    // @ts-ignore
    execution['task'] = task
  }
  res.status(200).json({ execution })
}
