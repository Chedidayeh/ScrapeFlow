import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function NotFoundPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
        <div className='text-center'>
            <h1 className='text-6xl font-bold text-primary mb-4'>
                404
            </h1>
            <h2 className='text-2xl font-semibold mb-4'>Page Not Found</h2>
            <p className='text-muted-foreground mb-4 max-w-md'>
                Please return Dashboard !
            </p>
            <Link href={"/"} >
            <Button size={"sm"} >
            <ArrowLeft size={16}  /> back to Dashboard 
            </Button>
            </Link>
        </div>
        
    </div>
  )
}
