import { Execution, ExecutionStatus } from "@/types"
import { Badge, Button } from "@chakra-ui/react"
import { DateTime } from "luxon"
import Link from "next/link"

interface Props {
  executions: Array<Execution>
}

const ExecutionTable = ({ executions }: Props) => {

  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case "enqueued":
        return 'gray'
      case "success":
        return 'green'
      case "running":
        return 'yellow'
      case "fail":
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <div className="min-w-full overflow-hidden overflow-x-auto align-middle border border-slate-300 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th
              className="bg-slate-200 px-6 py-2 text-left text-sm font-semibold text-slate-700"
              scope="col"
            >
              STATUS
            </th>
            <th
              className="bg-slate-200 px-6 py-2 text-left text-sm font-semibold text-slate-700"
              scope="col"
            >
              ID
            </th>
            <th
              className="bg-slate-200 whitespace-nowrap px-6 py-2 text-left text-sm font-semibold text-slate-700"
              scope="col"
            >
              TRIGGERED BY
            </th>
            <th
              className="bg-slate-200 px-6 py-2 text-left text-sm font-semibold text-slate-700"
              scope="col"
            >
              TIMESTAMP
            </th>
            <th
              className="bg-slate-200 px-6 py-2 text-left text-sm font-semibold text-slate-700"
              scope="col"
            >
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {executions.map((execution, i) => {
            const createdAtDateTime = DateTime.fromISO(execution.createdAt.toString())
            return (<tr key={execution.eid} className="bg-white">
              <td className="max-w-0 whitespace-nowrap px-6 py-2 text-sm text-slate-700">
                <div className="flex">
                  <Badge variant='subtle' colorScheme={getStatusColor(execution.status)}>
                    {execution.status}
                  </Badge>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-2 text-left text-sm text-gray-500">
                {execution.eid}
              </td>
              <td className="whitespace-nowrap px-6 py-2 text-left text-sm text-gray-500">
                {`Dev User`}
              </td>
              <td className="whitespace-nowrap px-6 py-2 text-left text-sm text-gray-500">
                <time dateTime={createdAtDateTime.toFormat("yyyy-MM-dd")}>{createdAtDateTime.toLocaleString(DateTime.DATETIME_FULL)}</time>

              </td>
              <td className="whitespace-nowrap px-6 py-2 text-left text-sm text-gray-500">
                <Link href={`/executions/${execution.eid}`}>
                  <Button size='xs'>
                    View
                  </Button>
                </Link>

              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ExecutionTable;
