import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import NodeCard from "./NodeCard";
import { AppNodeData } from "@/types/appNode";
import NodeHeader from "./NodeHeader";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { NodeInput, NodeInputs } from "./NodeInputs";
import { NodeOutput, NodeOutputs } from "./NodeOutputs";
import { Badge } from "@/components/ui/badge";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

const NodeComponent = memo((props: NodeProps) => {
    const nodeData = props.data as AppNodeData
    const task = TaskRegistry[nodeData.type]
    return <NodeCard nodeId={props.id}
        isSelected={props.selected}
    >   
        {DEV_MODE && <Badge>DEV : {props.id}</Badge> }
        <NodeHeader taskType={nodeData.type} nodeId={props.id} />
        <NodeInputs>
            {task.inputs.map(input => (
                <NodeInput key={props.id} input={input} nodeId={props.id} />
            ))}
        </NodeInputs>

        <NodeOutputs>
            {task.outputs.map(output => (
                <NodeOutput key={props.id} output={output} />
            ))}
        </NodeOutputs>

    </NodeCard>;
})
export default NodeComponent;
NodeComponent.displayName = "NodeComponent";