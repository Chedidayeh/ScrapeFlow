"use client";

import { Input } from "@/components/ui/input";
import { TaskParam, TaskParamType } from "@/types/task";
import StringParam from "./param/StringParam";
import { useReactFlow } from "@xyflow/react";
import { AppNode } from "@/types/appNode";
import { useCallback } from "react";
import BrowserInstanceParam from "./param/BrowserInstanceParam";
import SelectParam from "./param/SelectParam";
import CredentialParam from "./param/CredentialsParam";
import CredentialsParam from "./param/CredentialsParam";

function NodeParamField({ param, nodeId, disabled }: { param: TaskParam, nodeId: string, disabled: boolean }) {
    const { updateNodeData, getNode } = useReactFlow();
    const node = getNode(nodeId) as AppNode
    const value = node.data.inputs[param.name]

    const updateNodeParamValue = useCallback(
        (newValue: string) => {
            updateNodeData(nodeId, {
                inputs: {
                    ...node?.data.inputs,
                    [param.name]: newValue,

                },
            })
        },
        [nodeId, updateNodeData, param.name, node?.data.inputs]

    );

    switch (param.type) {
        case TaskParamType.STRING:
            return <StringParam disabled={disabled} param={param} value={value} updateNodeParamValue={updateNodeParamValue} />
        case TaskParamType.BROWSER_INSTANCE:
            return <BrowserInstanceParam param={param} value={""} updateNodeParamValue={updateNodeParamValue} />
        case TaskParamType.SELECT:
            return <SelectParam disabled={disabled} param={param} value={value} updateNodeParamValue={updateNodeParamValue} />
        case TaskParamType.CREDENTIAL:
            return <CredentialsParam disabled={disabled} param={param} value={value} updateNodeParamValue={updateNodeParamValue} />
        default:
            return (
                <div className="w-full">
                    <p className="text-xs text-muted-foreground">Not implemented</p>
                </div>
            )
    }
}

export default NodeParamField;