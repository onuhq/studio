import Head from 'next/head'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import { ChevronRightIcon, PlayIcon } from '@heroicons/react/20/solid'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Card, CardBody, Collapse, Heading, IconButton, Input, Kbd, Link, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spinner, Stack, StackDivider, Switch } from '@chakra-ui/react'
import { Tooltip } from '@chakra-ui/react'
// import ExecutionTable from '@/components/ExecutionTable'
import csv from 'csvtojson';
import { FileUploader } from "react-drag-drop-files";
import { DateTime } from 'luxon'
import { Execution, Field, IndexedField, Task } from '@/types'
import ExecutionTable from '@/components/ExecutionTable'
const fileTypes = ["CSV"];
import jsonTasks from '../../../tasks.json'
import { json } from 'stream/consumers'


interface FieldValue {
  id: string;
  value?: string | number | boolean | any[];
  required: boolean;
}

interface SelectFieldOption {
  id: string;
  name: string;
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}


const getFieldById = (id: string, fields?: IndexedField) => {
  if (!fields) return undefined;
  return fields[id]
}


export default function TaskDetails() {
  const [fieldValues, setFieldValues] = useState<Array<FieldValue>>([]);
  const [idCopied, setIdCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter()
  const { slug } = router.query;
  const [sdkVersion, setSdkVersion] = useState("");
  const [initialValueSet, setInitialValueSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [input, setInput] = useState<IndexedField>({});
  const [executions, setExecutions] = useState<any[]>([]);
  const [unpaginatedTasks, setUnpaginatedTasks] = useState<Task[]>([])

  const fetchTasks = useCallback(async () => {
    // @ts-ignore
    const matchingTask = jsonTasks.find(t => t.slug === slug) as Task;
    setTask(matchingTask);
  }, [slug])

  const getTask = useCallback(async (withLoading: boolean) => {
    if (task) {
      return;
    }
    if (withLoading) {
      setIsLoading(true);
    }
    try {
      const matchingTask = unpaginatedTasks.find(t => t.slug === slug) as Task;

      // if (!matchingTask) {
      //   setError('Task not found');
      // }
      // @ts-ignore
      setTask(matchingTask);
      setExecutions([]);
      setSdkVersion('do this later')
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [slug, task, unpaginatedTasks])


  const resetFieldValues = useCallback(() => {
    if (task && task.input) {
      const initialFieldValues = Object.keys(task.input).map(fieldKey => {

        return {
          id: fieldKey,
          value: getFieldById(fieldKey, task.input)?.type === 'boolean' ? false : undefined,
          required: getFieldById(fieldKey, task.input)?.required !== false
        }
      })
      setFieldValues(initialFieldValues);
      setInput(task.input);
    }
  }, [task])

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get("/api/isBuilding").then(response => {
        console.log(response.data);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTasks();

    if (task && !initialValueSet) {
      resetFieldValues()
      setInitialValueSet(true);
    }

    // reset field values if the input values of tasks have change since the last render
    if (task && initialValueSet && task.input && JSON.stringify(task.input) !== JSON.stringify(input)) {
      resetFieldValues()
    }

  }, [initialValueSet, resetFieldValues, getTask, task, fetchTasks, input])


  if (error) return <div>failed to load</div>
  if (isLoading && !initialValueSet) return <div className=''>loading...</div>

  const runTask = async () => {
    // Executes the task with the given values
    setIsSubmitting(true);

    const response = await axios.post('/api/tasks/run', {
      slug,
      rawInput: fieldValues,
    });
    router.push(`/executions/${response.data.execution.eid}`);
  }

  const updateFieldValue = (id: string, value: string | number | boolean | any[]) => {

    let updatedValues = fieldValues.map(fieldValue => {
      if (fieldValue.id === id && task && task.input) {
        const formattedInput = task.input;
        // get the type
        const fieldType = getFieldById(id, formattedInput)?.type;
        const fieldRequired = getFieldById(id, formattedInput)?.required !== false;
        let validatedValue: string | number | boolean | any[] = value;
        if (fieldType === "number" && typeof value === "string") {
          validatedValue = parseInt(value);
        }
        return {
          id,
          value: validatedValue,
          required: fieldRequired,
        }
      } else {
        return fieldValue
      }
    });
    setFieldValues(updatedValues);
  }

  const sideNav = [
    {
      title: "Owner",
      value: task?.owner ? `${task.owner}` : "Unknown",
    },
    // {
    //   title: "Creation time",
    //   value: task ? DateTime.fromISO(task.createdAt.toString()).toLocaleString(DateTime.DATETIME_FULL) : "",
    // },
    // {
    //   title: "Last updated at",
    //   value: task ? DateTime.fromISO(task.updatedAt.toString()).toLocaleString(DateTime.DATETIME_FULL) : "",
    // },
    {
      title: "SDK",
      value: sdkVersion ? `nodejs (${sdkVersion})` : "",
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleIdClick = (text: string) => {
    setIdCopied(true);
    copyToClipboard(text);
  }
  let validationError;
  const validateForm = () => {
    for (let fv of fieldValues) {
      // For boolean fields, ensure that the value is a boolean
      if (getFieldById(fv.id, input)?.type === "boolean") {
        // return true if the value is a boolean
        if (typeof fv.value === "boolean") {
          continue;
        } else {
          validationError = "Please fill in all required fields"
          return false;
        }
      }
      if (getFieldById(fv.id, input)?.type === "number") {
        // return true if the value is a 0
        if (fv.required && fv.value === 0) {
          continue;
        }
      }
      if (getFieldById(fv.id, input)?.type === "email") {
        // return false is the value is not a valid email
        const emailIsValid = (email: string) => {

          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        }

        if (fv.required && !fv.value) {
          validationError = "Please fill in all required fields"
          return false
        }

        if (!emailIsValid(fv.value as string)) {
          validationError = "Please enter a valid email address"
          return false;
        }

      }
      if (fv.required && !fv.value) {
        validationError = "Please fill in all required fields"
        return false
      }
    }
    return true;
  }

  const readFile = async (fieldKey: string, file: any) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const jsonArray = await csv({ trim: true }).fromString(reader.result as string);
      updateFieldValue(fieldKey, jsonArray)
    }
    // start reading the file. When it is done, calls the onload event defined above.
    reader.readAsText(file)
  }

  const renderInput = (fieldKey: string, field: Field) => {
    let inputField;

    switch (field.type) {
      case "string":
      case "number":
      case "text":
        const isNumber = field.type === "number";
        const type = isNumber ? "number" : "text";
        inputField = (
          // @ts-ignore
          <Input onChange={(e) => updateFieldValue(fieldKey, e.target.value)} required={field.required !== false} type={type} />
        )
        break;
      case "select":
        inputField = (
          <Select required={field.required !== false} onChange={(e) => updateFieldValue(fieldKey, e.target.value)} placeholder='Select option'>
            {field.options && field.options.map((option: SelectFieldOption | string) => {
              if (typeof option === "string") {
                return (<option key={option} value={option}>{option}</option>)
              }
              return (<option key={option.id} value={option.id}>{option.name || option.id}</option>)
            })}
          </Select>
        )
        break;
      case "boolean":
        inputField = (
          <Switch isRequired={field.required !== false} onChange={(e) => updateFieldValue(fieldKey, e.target.checked)} size='lg' />
        )
        break;
      case "csv":
        inputField = (
          <FileUploader required={field.required !== false} handleChange={(file: any) => readFile(fieldKey, file)} name="file" types={fileTypes} />
        )
        break;
      case "email":
        inputField = (
          <Input
            onChange={(e) => updateFieldValue(fieldKey, e.target.value)}
            required={field.required !== false}
            type={"email"} />)
        break;
      default:
        inputField = (
          <div>Unknown field type</div>
        )
    }

    return (
      <>
        <dd className="mt-1 text-sm text-gray-900">
          {inputField}
        </dd>
        {field.description && <dt className="text-sm font-medium italic pt-1 text-gray-500">{field.description}</dt>}

      </>
    )
  }

  const runButtonDisabled = !validateForm() || isSubmitting

  return (
    <>
      <Head>
        <title>Onu</title>
        <meta name="description" content="Task Details" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-full">
        <Navbar />

        <main className="py-5">



          <div className="mx-auto mt-3 grid max-w-3xl grid-cols-1 gap-10 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-4">
            <div className='lg:col-span-4 lg:col-start-1'>
              <Breadcrumb spacing='8px' separator={<ChevronRightIcon height={20} className='text-slate-500' />}>
                <BreadcrumbItem>
                  <Link href={'/'}>
                    <BreadcrumbLink as="span"><span className='text-slate-700 cursor-pointer text-base'>Tasks</span></BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>

                <BreadcrumbItem>
                  <Tooltip closeOnClick={false} className='rounded-lg' label={
                    <div className='flex flex-col items-center '>
                      <span className='font-mono text-xs'>{task?.slug}</span>
                      <span className='font-bold text-xs mt-3'>{idCopied ? 'Copied!' : 'Click to copy'}</span>
                    </div>}>

                    <BreadcrumbLink onMouseLeave={() => setIdCopied(false)} onClick={() => handleIdClick(task ? task.slug : "")}><span className='text-slate-700 underline decoration-dotted font-mono text-base'>{task ? task.slug : ""}</span></BreadcrumbLink>
                  </Tooltip>
                </BreadcrumbItem>
              </Breadcrumb>
            </div>
            <div className="space-y-6 lg:col-span-3 lg:col-start-1">

              <div className="mx-auto max-w-3xl md:flex md:items-center md:justify-between lg:max-w-7xl">
                <div className="flex items-center space-x-5">

                  <div>
                    <h1 className="text-2xl font-bold text-slate-700 mb-2">{task?.name}</h1>
                    {task?.description && <p className="text-sm font-medium text-gray-500">
                      {task?.description}
                    </p>}
                  </div>
                </div>
                <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">

                  <Tooltip isDisabled={!runButtonDisabled} label={validationError}>
                    <Button onClick={runTask} isDisabled={runButtonDisabled} leftIcon={isSubmitting ? <Spinner size={'sm'} /> : <PlayIcon height={18} />} colorScheme='blue' variant='solid'>
                      Run
                    </Button>
                  </Tooltip>
                  {/* <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label='Options'
                      icon={<EllipsisHorizontalIcon height={20} className='text-gray-600' />}
                      variant='outline'
                      borderColor={'gray.400'}
                    />
                    <MenuList>
                      <MenuItem command={`⌘ + E`} onClick={redirectToEditPage} color={'gray.800'}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => setDeletionModalOpen(true)} color={'red.500'}>
                        Delete
                      </MenuItem>

                    </MenuList>
                  </Menu> */}

                </div>
              </div>
              {/* Input list*/}
              <section className='' aria-labelledby="applicant-information-title">
                <div className="bg-white sm:rounded-lg border border-slate-300">
                  <div className="px-4 py-2 sm:px-6 sm:rounded-t-lg bg-slate-200 ">
                    <h2 id="applicant-information-title" className="text-base font-bold leading-6 text-slate-700">
                      Input
                    </h2>
                  </div>
                  <div style={{ maxHeight: '700px' }} className="border-t border-gray-200 px-4 py-5 sm:px-6 overflow-y-auto">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                      {(input && Object.keys(input).length > 0) ? Object.keys(input).map(fieldKey => {
                        // @ts-ignore
                        const field = input[fieldKey];
                        return (
                          <div key={fieldKey} className="sm:col-span-2">
                            <div className='flex justify-between'>
                              <dt className="text-base font-medium text-slate-700">{`${field.name || fieldKey} `}<span className={classNames(field.required === false ? "hidden" : "", "text-red-500")}>*</span><span className='font-normal text-sm text-slate-500 italic'>{`(${field.type})`}</span></dt>
                              <div className='bg-slate-200 px-2 py-1 rounded-lg text-xs text-slate-500 font-bold font-mono'>{fieldKey}</div>

                            </div>

                            {renderInput(fieldKey, field)}

                          </div>
                        )
                      }) :
                        <div className="sm:col-span-2 text-sm">
                          No input required
                        </div>
                      }

                    </dl>
                  </div>

                </div>
              </section>


            </div>
            {/* Task Information panel */}
            <section className="lg:col-span-1 lg:col-start-4 hidden md:grid">

              <Card bg="transparent" variant="unstyled" >


                <CardBody className='bg-transparent'>
                  <Stack divider={<StackDivider borderColor='gray.300' />} spacing='4'>
                    {sideNav.map((item, i) =>
                      <Box key={item.title}>
                        <Heading size='xs'>
                          {item.title}
                        </Heading>
                        <p className='pt-2 text-sm'>
                          {item.value}
                        </p>
                      </Box>
                    )}
                  </Stack>
                </CardBody>
              </Card>



            </section>


          </div>
          <div className="">
            <div className="mx-auto max-w-7xl sm:px-6 mt-12 pb-20">
              <div className="mt-2 flex flex-col">
                <div className='flex flex-row justify-between'>
                  <h3 className="text-md font-bold text-slate-700 mb-5">Previous executions</h3>
                </div>

                <ExecutionTable executions={executions ? executions : []} />

              </div>
            </div>
          </div>
        </main>
      </div>
    </>)


}
