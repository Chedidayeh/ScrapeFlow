"use client"

import { Button } from "@/components/ui/button";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, useReactFlow } from "@xyflow/react";

export default function DeletableEdge(props: EdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath(props)
    const { setEdges } = useReactFlow()
    return <>
        <BaseEdge path={edgePath} markerEnd={props.markerEnd} style={props.style} />
        <EdgeLabelRenderer>
            <div
                style={{
                    pointerEvents: "all",
                    position: "absolute",
                    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                }}
            >
                <Button
                    onClick={() => {
                        setEdges((edges) => edges.filter((edge) => edge.id
                            !== props.id));
                    }}
                    variant={"outline"}
                    size={"icon"}
                    className="w-5 h-5 border cursor-pointer rounded-full
                    text-xs leading-none hover:shadow-1g">
                    X
                </Button>
            </div>
        </EdgeLabelRenderer >
    </>;
}