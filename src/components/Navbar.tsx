import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';


const TestModeBanner = () => {
  return (
    <div className="bg-orange-300 h-1 flex items-center justify-center flex-row w-full z-10">
      <div className='h-12 w-32 rounded-b-lg flex items-end justify-center pb-1 bg-orange-300 self-center -z-10'>
        <p className='text-xs font-bold text-white'>TESTMODE</p>
      </div>
    </div>
  )
}

export default function Navbar() {
  const router = useRouter()

  const navigation = [
    { name: 'Documentation', href: null, onClick: () => router.push('https://docs.joinonu.com') },
  ]


  return (
    <>
      <header >
        <div className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <Popover className="flex h-16 justify-between">
              <div className="flex px-2 lg:px-0">
                <div className="flex flex-shrink-0 items-center">
                  <Link href={"/"}>
                    <Image
                      src="/images/onu_logo.png"
                      alt="Onu"
                      height={40}
                      width={50}
                      className="-ml-3"
                      priority
                    />
                  </Link>
                  <p className='font-bold text-lg cursor-default'>Studio</p>
                </div>
                <nav aria-label="Global" className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-4">
                  {navigation.map((item) => {
                    if (item.href) {
                      return (
                        <Link key={item.name} href={item.href} className="px-3 py-2 text-sm font-medium text-gray-900">
                          {item.name}
                        </Link>
                      )
                    } else {
                      return (
                        <div key={item.name} onClick={item.onClick} className=" cursor-pointer px-3 py-2 text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                      )
                    }


                  })}
                </nav>
              </div>

              <div className="flex items-center lg:hidden">
                {/* Mobile menu button */}
                <Popover.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                </Popover.Button>
              </div>
              <Transition.Root as={Fragment}>
                <div className="lg:hidden">
                  <Transition.Child
                    as={Fragment}
                    enter="duration-150 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="duration-150 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Popover.Overlay className="fixed inset-0 z-20 bg-black bg-opacity-25" aria-hidden="true" />
                  </Transition.Child>

                  <Transition.Child
                    as={Fragment}
                    enter="duration-150 ease-out"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="duration-150 ease-in"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Popover.Panel
                      focus
                      className="absolute top-0 right-0 z-30 w-full max-w-none origin-top transform p-2 transition"
                    >
                      <div className="divide-y divide-gray-200 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="pt-3 pb-2">
                          <div className="flex items-center justify-between px-4">
                            <div>
                              <Image
                                src="/images/onu_app_icon.png"
                                alt="Onu"
                                height={60}
                                width={70}
                                className="-ml-2"
                              />
                            </div>
                            <div className="-mr-2">
                              <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                              </Popover.Button>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1 px-2">
                            {navigation.map((item) => {
                              if (item.href) {
                                return (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                                  >
                                    {item.name}
                                  </Link>
                                )
                              } else {
                                return (
                                  <div
                                    key={item.name}
                                    onClick={item.onClick}
                                    className="block cursor-pointer rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                                  >
                                    {item.name}
                                  </div>
                                )
                              }

                            })}
                          </div>
                        </div>

                      </div>
                    </Popover.Panel>
                  </Transition.Child>
                </div>
              </Transition.Root>
            </Popover>
          </div>
        </div>
        <TestModeBanner />
      </header>
    </>
  )
}
