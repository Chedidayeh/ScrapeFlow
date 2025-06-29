import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { CodeIcon, DatabaseIcon, Edit3Icon, FileJson2, FileJson2Icon, GlobeIcon, LucideProps, MousePointerClick } from "lucide-react";

export const AddPropertyToJsonTask = {
    type: TaskType.ADD_PROPERTY_TO_JSON,
    label: "Add property to JSON ",
    icon: (props) => (
        <DatabaseIcon className="stroke-purple-400" {...props} />
    ),
    isEntryPoint: false,
    credits : 3,
    inputs : [
        {
            name:"JSON",
            type: TaskParamType.STRING,
            required : true,
        },
        {
            name:"Property Name",
            type: TaskParamType.STRING,
            required : true,
        },
        {
            name:"Property Value",
            type: TaskParamType.STRING,
            required : true,
        },
    ] as const,
    outputs: [
        { name: "Updated Json", type: TaskParamType.STRING },

    ] as const,
} satisfies WorkflowTask