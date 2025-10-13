import SideBar from '@/components/SideBar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React, { ReactNode } from 'react'

interface BlogsProps{
    children:ReactNode
}

const HomeLayout:React.FC<BlogsProps> = ({children}) => {
  return (
    <div>
        <SidebarProvider>
            <SideBar/>
            <main className='w-full'>
                <div className='w-full min-h-[calc(100vh-45px)] px-4'>
                    {children}
                </div>
            </main>
        </SidebarProvider>
    </div>
  )
}

export default HomeLayout