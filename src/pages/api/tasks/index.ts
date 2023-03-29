// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Task } from '@/types'
import devClient from '@/lib/devClient'
const onuPackage = require('@onuhq/node/package.json')


type Data = {
  tasks: Array<Task>,
  sdk: string,
  version: string,
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await devClient.init()
  const tasks = devClient.getAllTasks()
  res.status(200).json({ tasks, sdk: 'nodejs', version: onuPackage.version, })
}
