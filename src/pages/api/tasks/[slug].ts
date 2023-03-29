// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Execution, Task } from '@/types'
import devClient from '@/lib/devClient'
import cache from '@/lib/db';
const onuPackage = require('@onuhq/node/package.json')


type Data = {
  task: Task,
  sdk: string,
  version: string,
  executions: Execution[],
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { slug } = req.query
  await devClient.init()
  const task = devClient.getTaskBySlug(slug as string) || null
  // get all executions from the cache
  const executions: Execution[] = await cache.get('executions') || []

  // filter executions by task slug
  const taskExecutions = executions.filter((e) => e.taskSlug === task?.slug)

  res.status(200).json({ task, executions: taskExecutions, sdk: 'nodejs', version: onuPackage.version, })
}
