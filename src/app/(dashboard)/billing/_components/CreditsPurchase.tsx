"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditsPack, PackId } from '@/types/billing'
import { CoinsIcon, CreditCard } from 'lucide-react'
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { PurchaseCredits } from '@/actions/billing/actions'
import { toast } from 'sonner'

export default function CreditsPurchase() {
    const [selectedPack, setSelectedPack] = useState(PackId.MEDIUM);
    
    const mutation = useMutation({
        mutationFn: PurchaseCredits,
        onError: (error) => {
            toast.error('Failed to start purchase');
        }
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2x1 font-bold flex items-center gap-2">
                    {selectedPack}
                    <CoinsIcon className="h-6 w-6 text-primary" />
                    Purchase Credits
                </CardTitle>
                <CardDescription>
                    Select the number of credits you want to purchase
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup value={selectedPack} onValueChange={value=>{
                    setSelectedPack(value as PackId)
                }} >
                    {CreditsPack.map((pack) => (
                        <div
                            key={pack.id}
                            className={`flex bg-secondary/50 hover:bg-secondary items-center space-x-3 rounded-lg p-3 cursor-pointer ${selectedPack === pack.id ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setSelectedPack(pack.id as PackId)}
                            role="radio"
                            aria-checked={selectedPack === pack.id}
                            tabIndex={0}
                        >
                            <RadioGroupItem value={pack.id} id={pack.id} />
                            <Label className='flex justify-between w-full cursor-pointer' htmlFor={pack.id}>
                                <span className='font-medium'>
                                    {pack.name} - {pack.label}
                                </span>
                                <span className='font-bold text-primary'>$ {(pack.price / 100).toFixed(2)} </span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter>
                <Button
                    disabled={mutation.isPending}
                    onClick={() => {
                        toast.loading('Redirecting to payment...', { id: 'purchase-credits' });
                        mutation.mutate(selectedPack);
                    }}
                >
                    <CreditCard className='mr-2 h-5 w-5' /> Purchase credits
                </Button>
            </CardFooter>
        </Card>
    )
}
