// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Execution, Task } from '@/types'
import devClient from '@/lib/devClient'
import cache from '@/lib/db';
import { ValidationResponse } from '@onuhq/node';
import { PassThrough } from 'stream';
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

const determineIfIsValidationResponse = (response: boolean | ValidationResponse): response is ValidationResponse => {
  return (response as ValidationResponse).valid !== undefined;
}

const originalConsoleLog = console.log;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  console.log = originalConsoleLog;
  const stream = new PassThrough();
  const logs: string[] = [];
  stream.on('data', (chunk) => {
    logs.push(chunk.toString());
  });
  console.log = ((oldFn) => (...args) => {
    stream.write(`${args.join(' ')}\n`);
    oldFn.apply(console, args);
  })(console.log);

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

  let updatedExecutions: Execution[];
  const context = {
    executionId: execution.eid,
  }

  const validated = task.validate ? await task.validate(input, context) : true;
  if (!validated) {
    updatedExecutions = executions.map((e) => {
      if (e.eid === execution.eid) {
        return {
          ...e,
          status: 'fail',
          returnValue: {
            error: 'Validation failed',
            errors: determineIfIsValidationResponse(validated) ? validated.errors : []
          }
        }
      }
      return e
    })
    executions.splice(0, executions.length, ...updatedExecutions)
    await cache.set('executions', executions)
    res.status(200).json({ execution, sdk: 'nodejs', version: onuPackage.version, })
    return
  }

  process.env.ONU_INTERNAL__DEBUG_MODE = 'true'
  process.env.ONU_INTERNAL__EXECUTION_ID = execution.eid
  try {
    const result = await task.run(input, context)

    updatedExecutions = executions.map((e) => {
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
  } catch (e) {
    // TODO: Handle errors
  }
  process.env.ONU_INTERNAL__EXECUTION_ID = ''
  stream.end();
  console.log = originalConsoleLog;
  res.status(200).json({ execution, sdk: 'nodejs', version: onuPackage.version, })
}
