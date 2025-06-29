'use client'
import { usePathname } from 'next/navigation'
import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Link from 'next/link'
import { MobileSidebar } from './Sidebar'

export default function BreadcrumbHeader() {
    const pathName = usePathname()
    const paths = pathName.split('/').filter(p => p)

    return (
        <div className='flex items-center justify-start'>
            <MobileSidebar />
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {paths.length > 0 && <BreadcrumbSeparator />}
                    {paths.map((path, index) => {
                        const href = `/${paths.slice(0, index + 1).join('/')}`
                        const isLast = index === paths.length - 1
                        return (
                            <React.Fragment key={index}>
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={href}>
                                                <span className="text-foreground font-semibold">
                                                    {path.charAt(0).toUpperCase() + path.slice(1).replaceAll("-", " ")}
                                                </span>
                                            </Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={href}>
                                                {path.charAt(0).toUpperCase() + path.slice(1).replaceAll("-", " ")}
                                            </Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {index !== paths.length - 1 && <BreadcrumbSeparator />}
                            </React.Fragment>
                        )
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}
