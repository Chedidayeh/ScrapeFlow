import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { CodeIcon, Edit3Icon, GlobeIcon, LucideProps, MousePointerClick } from "lucide-react";

export const ClickElementTask = {
    type: TaskType.CLICK_ELEMENT,
    label: "Click element ",
    icon: (props) => (
        <MousePointerClick className="stroke-orange-400" {...props} />
    ),
    isEntryPoint: false,
    credits : 3,
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
    ] as const,
    outputs: [
        { name: "Web Pgae", type: TaskParamType.BROWSER_INSTANCE },

    ] as const,
} satisfies WorkflowTask