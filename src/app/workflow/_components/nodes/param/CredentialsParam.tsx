import { GetCredentialsForUser } from '@/actions/credentials/actions';
import { Label } from '@/components/ui/label';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel, SelectGroup } from '@/components/ui/select';
import { ParamProps } from '@/types/appNode';
import { useQuery } from '@tanstack/react-query';
import React, { useId } from 'react'


export default function CredentialsParam({ param, updateNodeParamValue, value }: ParamProps) {
    const id = useId();
    const query = useQuery({
        queryKey: ["credentials-for-user"],
        queryFn: () => GetCredentialsForUser(),
        refetchInterval: 10000,
    })
    return (
        <div className="flex flex-col gap-1 w-full">
            <Label htmlFor={id} className="text-xs flex">
                {param.name}
                {param.required && <p className="[text-red-400 px-2"> *</p>
                }
            </Label>
            <Select defaultValue={value} onValueChange={value => {
                updateNodeParamValue(value)
            }}>
                <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{(query.data! && query.data?.length) > 0 ? "Credentials" : "no credentials found yet"}</SelectLabel>
                        {query.data?.map((credential) => (
                            <SelectItem key={credential.id} value={credential.id}>
                                {credential.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>)
}
