import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { CodeIcon, Edit3Icon, FileJson2, FileJson2Icon, GlobeIcon, LucideProps, MousePointerClick } from "lucide-react";

export const ReadPropertyFromJsonTask = {
    type: TaskType.READ_PROPERTY_FROM_JSON,
    label: "Read property from JSON ",
    icon: (props) => (
        <FileJson2Icon className="stroke-purple-400" {...props} />
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
    ] as const,
    outputs: [
        { name: "Property Value", type: TaskParamType.STRING },

    ] as const,
} satisfies WorkflowTask