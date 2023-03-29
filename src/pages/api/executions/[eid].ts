// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Execution } from '@/types'
import cache from '@/lib/db';
import devClient from '@/lib/devClient';


type Data = {
  execution: Execution | null,
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { eid } = req.query
  if (Object.keys(devClient.tasks).length === 0) {
    await devClient.init()
  }
  const executions: Execution[] = await cache.get('executions') || []

  const execution = executions.find((e) => e.eid === eid) || null
  const task = devClient.getTaskBySlug(execution?.taskSlug as string) || null

  if (task && execution) {
    execution['task'] = task
  }
  res.status(200).json({ execution })
}
