import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { CodeIcon, Edit3Icon, EyeIcon, GlobeIcon, LucideProps, MousePointerClick } from "lucide-react";

export const WaitForElementTask = {
    type: TaskType.WAIT_FOR_ELEMENT,
    label: "Wait for element ",
    icon: (props) => (
        <EyeIcon className="stroke-blue-400" {...props} />
    ),
    isEntryPoint: false,
    credits : 1,
    inputs : [
        {
            name:"Web page",
            type: TaskParamType.BROWSER_INSTANCE,
            required : true,
        },
        {
            name:"Selector",
            type: TaskParamType.STRING,
            required : true,
        },
        {
            name:"Visibility",
            type: TaskParamType.SELECT,
            hideHandle : true,
            required : true,
            options : [
                {
                    label : "Visible" , value : "visible",
                },
                {
                    label : "Hidden" , value : "hidden",
                }
            ]
        },
    ] as const,
    outputs: [
        { name: "Web Pgae", type: TaskParamType.BROWSER_INSTANCE },

    ] as const,
} satisfies WorkflowTask