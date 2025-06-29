import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { CodeIcon, Edit3Icon, GlobeIcon, Link2Icon, LucideProps, MousePointerClick } from "lucide-react";

export const NavigateUrlTask = {
    type: TaskType.NAVIGATE_URL,
    label: "Navigate url ",
    icon: (props) => (
        <Link2Icon className="stroke-orange-400" {...props} />
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
            name:"URL",
            type: TaskParamType.STRING,
            required : true,
        },
    ] as const,
    outputs: [
        { name: "Web Pgae", type: TaskParamType.BROWSER_INSTANCE },

    ] as const,
} satisfies WorkflowTask