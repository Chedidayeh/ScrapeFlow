"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskRegistry } from '@/lib/workflow/task/registry';
import { TaskType } from '@/types/task';
import { CoinsIcon } from 'lucide-react';
import React from 'react'

export default function TaskMenu() {
    return (
        <aside className="w-[340px] min-w-[340px] max-w-[340px] border-r-2
    border-separate h-full p-2 px-4 overflow-auto">
            <Accordion type="multiple" className="w-full" defaultValue={["extraction" , "interactions" , "timing" , "results" , "storage"]}>

                <AccordionItem value="extraction">
                    <AccordionTrigger className="font-bold">
                        Data extraction
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                        <TaskMenuBtn taskType={TaskType.PAGE_TO_HTML} />
                        <TaskMenuBtn taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT} />
                        <TaskMenuBtn taskType={TaskType.EXTRACT_DATA_WITH_AI} />

                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="interactions">
                    <AccordionTrigger className="font-bold">
                        User Interactions
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                        <TaskMenuBtn taskType={TaskType.FILL_INPUT} />
                        <TaskMenuBtn taskType={TaskType.CLICK_ELEMENT} />
                        <TaskMenuBtn taskType={TaskType.NAVIGATE_URL} />
                    </AccordionContent>
                </AccordionItem>


                <AccordionItem value="timing">
                    <AccordionTrigger className="font-bold">
                    Timing controls
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                        <TaskMenuBtn taskType={TaskType.WAIT_FOR_ELEMENT} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="results">
                    <AccordionTrigger className="font-bold">
                    Result delivery
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                        <TaskMenuBtn taskType={TaskType.DELIVER_VIA_WEBHOOK} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="storage">
                    <AccordionTrigger className="font-bold">
                    Data storage
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                    <TaskMenuBtn taskType={TaskType.READ_PROPERTY_FROM_JSON} />
                    <TaskMenuBtn taskType={TaskType.ADD_PROPERTY_TO_JSON} />
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </aside>
    );
}


function TaskMenuBtn({ taskType }: { taskType: TaskType }) {
    const task = TaskRegistry[taskType];

    const onDragStrart = (event : React.DragEvent , type : TaskType)=>{
        event.dataTransfer.setData("application/reactflow", type);
        event.dataTransfer.effectAllowed = "move";
    }
    return (
        <Button
            draggable
            onDragStart={event => onDragStrart(event , taskType)}
            variant={"secondary"}
            className="flex justify-between items-center gap-2 border w-full"
        >
            <div className="flex items-center gap-2">
                <task.icon size={20} />
                {task.label}
            </div>
            <Badge variant={"outline"} className='gap-1 flex items-center'>
                <CoinsIcon size={16} />
                {task.credits}
            </Badge>
        </Button>

    );
}

