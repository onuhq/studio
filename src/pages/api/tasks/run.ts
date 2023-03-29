// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Execution, Task } from '@/types'
import devClient from '@/lib/devClient'
import cache from '@/lib/db';
const onuPackage = require('@onuhq/node/package.json')


type Data = {
  execution: Execution,
  sdk: string,
  version: string,
}


const convertInput = (inputList: Array<any>) => {
  // Converts input to the shape needed for dot notation
  let finalInput: any = {}
  for (let inputObj of inputList) {
    finalInput[inputObj.id] = inputObj.value
  }

  return finalInput;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  const { slug, rawInput } = req.body
  const input = convertInput(rawInput)
  await devClient.init()
  const task = devClient.getTaskBySlug(slug as string) || null
  if (!task) {
    res.status(404).send('Task not found')
    return
  }
  const execution: Execution = {
    eid: `ex_${Math.random().toString(36).substr(2, 9)}`,
    taskSlug: task.slug,
    input: input,
    status: 'running',
    createdAt: new Date()
  }
  // Add to the cache 
  const executions: Execution[] = await cache.get('executions') || []


  executions.push(execution);
  await cache.set('executions', executions)


  const context = {
    executionId: execution.eid,
  }
  const result = await task.run(input, context)

  const updatedExecutions: Execution[] = executions.map((e) => {
    if (e.eid === execution.eid) {
      return {
        ...e,
        status: 'success',
        returnValue: result
      }
    }
    return e
  })
  executions.splice(0, executions.length, ...updatedExecutions)
  await cache.set('executions', executions)
  res.status(200).json({ execution, sdk: 'nodejs', version: onuPackage.version, })
}
