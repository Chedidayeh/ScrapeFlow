"use client";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { TaskType } from "@/types/task";
import { Workflow } from "@prisma/client";
import { addEdge, Background, BackgroundVariant, Connection, Controls, Edge, getOutgoers, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeComponent from "./nodes/NodeComponent";
import { useCallback, useEffect, useRef } from "react";
import { AppNode } from "@/types/appNode";
import DeletableEdge from "./edges/DeletableEdge";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { UpdateWorkflow } from "@/actions/workflows/workflows";

const nodeTypes = {
    FlowScrapeNode: NodeComponent,
}

const edgeTypes = {
    default: DeletableEdge
}

const snapGrid: [number, number] = [50, 50];
const fitViewOptions = { padding: 1 };

function FlowEditor({ workflow }: { workflow: Workflow }) {
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { setViewport, screenToFlowPosition, updateNodeData, toObject } = useReactFlow();

    // auto save functionality
    const isInitialLoad = useRef(true);

    useEffect(() => {
        try {
            const flow = JSON.parse(workflow.definition);
            if (!flow) {
                isInitialLoad.current = false;
                return;
            };
            setNodes(flow.nodes || [])
            setEdges(flow.edges || [])
            if (!flow.viewport) {
                isInitialLoad.current = false;
                return;
            };
            const { x = 0, y = 0, zoom = 1 } = flow.viewport
            setViewport({ x, y, zoom })
        } catch (error) {
            isInitialLoad.current = false;
        }
    }, [workflow.definition, setNodes, setViewport, setEdges]);

    const saveMutation = useMutation({
        mutationFn: UpdateWorkflow,
        onSuccess: () => {
            toast.success("Flow saved successfully", { id: "save-workflow" });
        },
        onError: () => {
            toast.error("Something went wrong", { id: "save-workflow" });
        }
    });

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            const workflowDefinition = JSON.stringify(toObject());
            toast.loading("Saving workflow...", { id: "save-workflow" });
            saveMutation.mutate({
                id: workflow.id,
                definition: workflowDefinition,
            });
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [JSON.stringify(nodes), JSON.stringify(edges)]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        const taskType = event.dataTransfer.getData("application/reactflow");
        if (typeof taskType === undefined || !taskType) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        const newNode = CreateFlowNode(taskType as TaskType, position)
        setNodes((nds) => nds.concat(newNode))
    }, [screenToFlowPosition, setNodes]);

    const onConnect = useCallback((connection: Connection) => {
        setEdges(eds => addEdge({ ...connection, animated: true }, eds))
        if (!connection.targetHandle) return
        const node = nodes.find((nd) => nd.id === connection.target);
        if (!node) return;
        const nodeInputs = node.data.inputs;

        updateNodeData(node.id, {
            inputs: {
                ...nodeInputs,
                [connection.targetHandle]: ""
            }
        })
    }, [setEdges, updateNodeData, nodes])

    const isValidConnection = useCallback((connection: Edge | Connection) => {
        // Prevent self-connections.
        if (connection.source === connection.target) {
            toast.error("Invalid connection: self-connections are not allowed");
            return false;
        }

        // Find the source and target nodes for the connection.
        const source = nodes.find((node) => node.id === connection.source);
        const target = nodes.find((node) => node.id === connection.target);

        // If either node is not found, the connection is invalid.
        if (!source || !target) {
            toast.error("Invalid connection: source or target node not found");
            return false;
        }

        // Retrieve task definitions from the registry.
        const sourceTask = TaskRegistry[source.data.type]
        const targetTask = TaskRegistry[target.data.type]

        // Find the corresponding output on the source node.
        const output = sourceTask.outputs.find(
            (o) => o.name === connection.sourceHandle
        );

        // Find the corresponding input on the target node.
        const input = targetTask.inputs.find(
            (o) => o.name === connection.targetHandle
        );

        // The connection is valid only if the input and output types match.
        if (input?.type !== output?.type) {
            toast.error("Invalid connection: type mismatch");
            return false;
        }

        // Depth First Search or DFS , starting from the target node of the proposed connection.
        const hasCycle = (node: AppNode, visited = new Set()): boolean => {
            if (visited.has(node.id)) return false;

            visited.add(node.id);

            for (const outgoer of getOutgoers(node, nodes, edges)) {
                if (outgoer.id === connection.source) return true;
                if (hasCycle(outgoer, visited)) return true;
            }
            return false;
        };

        const detectedCycle = hasCycle(target);
        if (detectedCycle) {
            toast.error("Invalid connection: creating a cycle is not allowed");
        }
        return !detectedCycle;
    }, [edges, nodes]);


    return (
        <main className="h-full w-full">
            <ReactFlow
                
                nodes={nodes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                snapToGrid
                snapGrid={snapGrid}
                fitView
                fitViewOptions={fitViewOptions}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
            >
                <Controls position="top-left" />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </main>
    );
}
export default FlowEditor;