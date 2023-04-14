import {
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  XCircleIcon,

} from '@heroicons/react/20/solid'
import Navbar from '@/components/Navbar'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import { useCallback, useEffect, useState } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  IconButton,
  Input,
  Tooltip,
  Tag,
  TagLeftIcon,
  TagLabel,
  Collapse,
} from '@chakra-ui/react'
import { CSVLink } from "react-csv";
import { Execution, ExecutionStatus } from '@/types'
import { AgGridReact } from 'ag-grid-react'
import { JetBrains_Mono } from 'next/font/google'

import axios from 'axios'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const jetbrains = JetBrains_Mono({ subsets: ['latin'] })


function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}



const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case "enqueued":
      return {
        icon: ClockIcon,
        bgColor: 'bg-gray-500',
        colorScheme: 'gray',
        textColor: 'text-gray-100',
      }
    case "running":
      return {
        icon: ArrowPathIcon,
        bgColor: 'bg-yellow-500',
        colorScheme: 'yellow',
        textColor: 'text-yellow-100',
      }
    case "success":
      return {
        icon: CheckIcon,
        bgColor: 'bg-green-600',
        colorScheme: 'green',
        textColor: 'text-green-100',
      }
    case "fail":
      return {
        icon: XCircleIcon,
        bgColor: 'bg-red-600',
        colorScheme: 'red',
        textColor: 'text-red-100',
      }
    default:
      return {
        icon: QuestionMarkCircleIcon,
        bgColor: 'bg-gray-500',
        colorScheme: 'gray',
        textColor: 'text-gray-100',
      }
  }
}

export default function TaskExecution() {
  const router = useRouter()
  const { eid } = router.query;
  const [idCopied, setIdCopied] = useState(false);
  const [inputShown, setInputShown] = useState(false);
  const [execution, setExecution] = useState<Execution | undefined>(undefined);
  const [updating, setUpdating] = useState(false);

  const getExecution = useCallback(async () => {
    const resp = await axios.get(`/api/executions/${eid}`)
    setExecution(resp.data.execution)
  }, [eid])

  const refreshExecution = async () => {
    setUpdating(true);
    await getExecution();
    setUpdating(false);
  }

  useEffect(() => {
    getExecution()
  }, [eid, getExecution])

  if (!execution) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        loading...
      </div>
    )
  }

  const statusIcon = getStatusIcon(execution?.status);
  const createdAtDateTime = DateTime.fromISO(execution.createdAt.toString())

  const input = execution?.input

  const formatOutput = (output: any) => {
    // If the output is a string, add a key and return it as an object
    // if the output is an object, return it as is
    if (typeof output === 'string') {
      const formattedOutput = {
        output: output
      }
      return formattedOutput
    }
    return output
  }


  function formatJSON(val: any) {
    try {
      return formatOutput(val);
    } catch {
      return formatOutput(val)
    }
  }

  const formattedName = 'Dev User'
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleIdClick = (text: string) => {
    setIdCopied(true);
    copyToClipboard(text);
  }


  const tableValue = execution ? formatJSON(execution.returnValue) : {}
  const isArray = Array.isArray(tableValue);

  const csvData = isArray ? tableValue : Object.entries(tableValue);


  const OutputTable = () => {


    const renderHeaders = () => {
      const cellClass = 'border-r border-r-gray-200'

      if (isArray) {
        const firstValue = tableValue[0];
        if (firstValue) {
          return Object.keys(firstValue).map((key, i) => {
            return {
              headerName: key,
              field: key,
              cellClass: `${cellClass}`,
            }
          });
        }

      } else {
        return [
          {
            headerName: "Key",
            field: "key",
            cellClass,
          },
          { headerName: "Value", field: "value", cellClass, },

        ]
      }
    }

    const renderBody = () => {
      if (isArray) {
        return tableValue;
      }

      const rowData = Object.keys(tableValue).map((key, i) => {
        let value = tableValue[key];
        // check of the value is an object
        if (typeof value === 'object') {
          // if it is an object, return the key and the stringified value
          value = JSON.stringify(value)
        }
        return {
          key,
          value
        }
      })
      return rowData
    }
    return (
      <div
        className="ag-theme-alpine"
        style={{
          height: '500px',
          width: '100%',

        }}
      >
        <AgGridReact
          className="border rounded-b-lg"
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            editable: true,
          }}
          headerHeight={32}
          readOnlyEdit={true}
          rowClass={`text-xs ${jetbrains.className}`}
          rowHeight={32}
          columnDefs={renderHeaders()}
          rowData={renderBody()}>
        </AgGridReact>
      </div >
    )
  }

  return (
    <>
      <Head>
        <title>Onu</title>
        <meta name="description" content="Task Execution" />
        <link rel="icon" href="/images/favicon.ico" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-full">
        <Navbar />

        <main className="py-5">
          {/* Page header */}
          <div className='pb-8 mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8'>
            <Breadcrumb spacing='8px' separator={<ChevronRightIcon height={20} className='text-slate-500' />}>
              <BreadcrumbItem>
                <Link href={'/'}>
                  <BreadcrumbLink as="span"><span className='text-slate-700 cursor-pointer text-base'>Tasks</span></BreadcrumbLink>
                </Link>
              </BreadcrumbItem>

              <BreadcrumbItem>

                <Link href={`/tasks/${execution?.taskSlug}`}>
                  <BreadcrumbLink as="span"><span className='text-slate-700  text-base'>{execution?.taskSlug}</span></BreadcrumbLink>
                </Link>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <span className='text-slate-700 cursor-default text-base'>Executions</span>
              </BreadcrumbItem>

              <BreadcrumbItem>
                <Tooltip closeOnClick={false} className='rounded-lg' label={
                  <div className='flex flex-col items-center '>
                    <span className='font-mono text-xs'>{execution?.eid}</span>
                    <span className='font-bold text-xs mt-3'>{idCopied ? 'Copied!' : 'Click to copy'}</span>
                  </div>}>

                  <BreadcrumbLink onMouseLeave={() => setIdCopied(false)} onClick={() => handleIdClick(execution.eid)}><span className='text-slate-700 underline decoration-dotted font-mono text-base'>{execution.eid.slice(-8)}</span></BreadcrumbLink>
                </Tooltip>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">

            <div className="flex items-center space-x-5">

              <div>
                <div className='flex flex-row mb-2'>
                  <h1 className="text-2xl font-bold text-gray-900  mr-3">Execution details</h1>
                  <Tag variant='solid' className={classNames(statusIcon.bgColor, statusIcon.textColor, 'py-1 px-2 justify-center')}>
                    <TagLeftIcon as={() => <statusIcon.icon className="h-5 w-5 mr-1" aria-hidden="true" />} />
                    <TagLabel>{execution.status.toUpperCase()}</TagLabel>
                  </Tag>
                </div>
                <p className="text-sm font-medium text-gray-500">
                  Triggered by{' '}
                  <a href="#" className="text-gray-900">
                    {formattedName}
                  </a>{' '}
                  on <time dateTime={createdAtDateTime.toFormat("yyyy-MM-dd")}>{createdAtDateTime.toLocaleString(DateTime.DATETIME_FULL)}</time>
                </p>
              </div>
            </div>
            <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
              <IconButton
                variant='outline'
                aria-label='Refresh data'
                colorScheme={'blackAlpha'}
                isLoading={updating}
                onClick={refreshExecution}
                icon={<ArrowPathRoundedSquareIcon height={20} className='text-slate-700' />}
              />
              <Link href={`/tasks/${execution?.taskSlug}`}>
                <Button leftIcon={<PlayIcon height={18} />} colorScheme='blue' variant='solid'>
                  Run again
                </Button>
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-3 lg:col-start-1">
              {/* Input list*/}
              <div className="bg-white sm:rounded-lg border-slate-300 border">
                <div className={classNames(inputShown ? " rounded-t-lg" : "rounded-lg", "px-2 py-2 sm:px-4 bg-slate-200 flex flex-row justify-between items-center")} onClick={() => setInputShown(!inputShown)}>
                  <h2 className="text-xs font-bold text-gray-900">
                    INPUT
                  </h2>
                  {inputShown ? <ChevronDownIcon height={25} className='text-slate-500' /> :
                    <ChevronRightIcon height={25} className='text-slate-500' />}
                </div>
                <Collapse in={inputShown} animateOpacity>

                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                      {(execution.task?.input && Object.keys(execution.task.input).length > 0) ? Object.keys(execution.task.input).map(fieldKey => {
                        // @ts-ignore
                        const field = execution.task.input[fieldKey];
                        return (
                          <div key={fieldKey} className="sm:col-span-1 sm:col-start-1">
                            <dt className="text-sm font-medium text-slate-700">{field.name || fieldKey}</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <Input disabled variant='filled' className="cursor-not-allowed shadow appearance-none border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" type="text" value={input[fieldKey]} />
                            </dd>
                          </div>
                        )
                      }) :
                        <div className="sm:col-span-2 text-sm">
                          No input provided
                        </div>
                      }

                    </dl>
                  </div>
                </Collapse>

              </div>


              <div className="bg-white  sm:rounded-lg min-h-">


                <div className="px-2 border border-slate-300 border-b-0 pr-0 py-2 sm:px-4 sm:pr-2 bg-slate-200 rounded-t-lg flex flex-row justify-between items-center">
                  <h2 className="text-xs font-bold text-gray-900">
                    OUTPUT
                  </h2>
                  <CSVLink filename={`onu_execution_${execution.eid.slice(-8)}.csv`} data={csvData}>

                    <Button className='bg-slate-700 text-white hover:bg-slate-800' size={'xs'}>
                      Download CSV
                    </Button>
                  </CSVLink>

                </div>

                {execution.returnValue ? <OutputTable /> : null}

              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  )
}
