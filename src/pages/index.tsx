import Head from 'next/head'
import Link from 'next/link'
import AppHeader from '@/components/Navbar'
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/20/solid'
import { Button, Kbd, Spinner, Tooltip } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Task } from '@/types'
import axios from 'axios'

const yaml = require('js-yaml');


function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

function EmptyState() {
  return (
    <div className="text-center">

      <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
      <div className="mt-6">
        <Button
          className='hover:bg-slate-400 focus:outline-none '
          isLoading={false}
          colorScheme='blue'
          leftIcon={<PlusIcon height={20} />}
          size={'sm'}
        >
          Create Task
        </Button>
      </div>
    </div>
  )
}


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchTasks = async () => {
    const res = await axios.get('/api/tasks')
    setTasks(res.data.tasks)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <>
      <Head>
        <title>Onu Studio</title>
        <meta name="description" content="Tasks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <div className="min-h-full">
        <AppHeader />
        <main className="flex-1 py-10">



          <div className="mb-6 mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
            <div className="flex items-center space-x-5">

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Tasks</h1>

              </div>
            </div>
          </div>

          <div className="">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mt-2 flex flex-col">
                <div className="min-w-full overflow-hidden overflow-x-auto align-middle border border-slate-300 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th
                          className="bg-slate-200 px-6 py-3 text-left text-sm font-semibold text-slate-700"
                          scope="col"
                        >
                          NAME
                        </th>
                        <th
                          className="bg-slate-200 px-6 py-3 text-right text-sm font-semibold text-slate-700"
                          scope="col"
                        >
                          OWNER
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {tasks?.map((task, i) => (
                        <tr key={task.slug} className="bg-white">
                          <td className="w-full max-w-0 whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                            <div className="flex">
                              <Link href={`/tasks/${task.slug}`} className="group inline-flex space-x-2 truncate text-sm">
                                {/* <BanknotesIcon
                                  className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                /> */}
                                <p className="truncate text-gray-500 group-hover:text-slate-700">
                                  {task.name}
                                </p>
                              </Link>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                            {task.owner ? `${task.owner}` : "Unknown"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Empty */}
                  {!isLoading && tasks.length === 0 && <div
                    className="flex flex-col justify-center items-center border-t border-gray-200 bg-white px-4 py-8 sm:px-8"
                    aria-label="EmptyState"
                  >
                    <EmptyState />
                  </div>}

                  {isLoading && <div
                    className="flex flex-col justify-center items-center border-t border-gray-200 bg-white px-4 py-8 sm:px-8"
                    aria-label="EmptyState"
                  >
                    <Spinner
                      thickness='4px'
                      speed='0.65s'
                      emptyColor='gray.200'
                      color='blue.500'
                      size='xl'
                    />
                  </div>}
                  {/* Pagination
                  <div
                    className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
                    aria-label="Pagination"
                  >
                    <div className="hidden sm:block">
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{tasks.length > 0 ? 1 : 0}</span> to <span className="font-medium">{tasks.length}</span> of{' '}
                        <span className="font-medium">{tasks.length}</span> results
                      </p>
                    </div>
                    <div className="flex flex-1 justify-between sm:justify-end">
                      <a
                        href="#"
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Previous
                      </a>
                      <a
                        href="#"
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Next
                      </a>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </main>


      </div >
    </>
  )
}
