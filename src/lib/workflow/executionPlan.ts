import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/types/workflow";
import { Edge } from "@xyflow/react";
import { TaskRegistry } from "./task/registry";

// Enum to represent possible validation errors during execution plan creation
export enum FlowToExecutionPlanValidationError {
    "NO_ENTRY_POINT",
    "INVALID_INPUTS",
}

// The return type now includes an optional error field for validation errors
// If error is present, executionPlan will be undefined
// If executionPlan is present, error will be undefined
// error.invalidElements contains details about nodes with missing/invalid inputs
type FlowToExecutionPlanType = {
    executionPlan?: WorkflowExecutionPlan;
    error?: {
        type: FlowToExecutionPlanValidationError;
        invalidElements?: AppNodeMissingInputs[]
    }
}

export function FlowToExecutionPlan(
    nodes: AppNode[],
    edges: Edge[],
): FlowToExecutionPlanType {

    // Find the entry point node (the node that starts the workflow)
    const entryPoint = nodes.find((node) => TaskRegistry[node.data.type].isEntryPoint)

    if (!entryPoint) {
        // If no entry point is found, return a validation error
        return {
            error: {
                type: FlowToExecutionPlanValidationError.NO_ENTRY_POINT
            }
        }
    }

    // Collects nodes with invalid or missing inputs for error reporting
    const inputsWithErrors: AppNodeMissingInputs[] = [];

    // Set to keep track of nodes that have already been planned (scheduled for execution)
    const planned = new Set<string>()

    // Check entry point for invalid inputs before proceeding
    const invalidInputs = getInvalidInputs(entryPoint, edges, planned)

    if (invalidInputs.length > 0) {
        // If entry point has invalid inputs, record them for error reporting
        inputsWithErrors.push({
            nodeId: entryPoint.id,
            inputs: invalidInputs,
        });
    }

    // Initialize the execution plan with the entry point as the first phase
    const executionPlan: WorkflowExecutionPlan = [
        {
            phase: 1,
            nodes: [entryPoint]
        },
    ]

    planned.add(entryPoint.id)

    // Build the execution plan phase by phase
    // Each phase contains nodes that can be executed in parallel (all their dependencies are satisfied)
    for (let phase = 2; phase <= nodes.length && planned.size < nodes.length; phase++) {
        // Create a new phase
        const nextPhase: WorkflowExecutionPlanPhase = { phase, nodes: [] }
        for (const currentNode of nodes) {

            if (planned.has(currentNode.id)) {
                // Skip nodes that are already in the execution plan
                continue
            }

            // Check if the current node has any invalid (unsatisfied) inputs
            const invalidInputs = getInvalidInputs(currentNode, edges, planned)

            if (invalidInputs.length > 0) {
                // If there are invalid inputs, check if all incoming nodes (dependencies) are already planned
                const incomers = getIncomers(currentNode, nodes, edges);
                if (incomers.every(incomer => planned.has(incomer.id))) {
                    // If all dependencies are planned but there are still invalid inputs,
                    // record the node and its invalid inputs for error reporting
                    inputsWithErrors.push({
                        nodeId: currentNode.id,
                        inputs: invalidInputs,
                    });
                } else {
                    // If not all dependencies are planned, skip this node for now
                    continue
                }
            }
            nextPhase.nodes.push(currentNode)
        }

        // Mark all nodes in this phase as planned (scheduled for execution)
        for (const node of nextPhase.nodes) {
            planned.add(node.id)
        }

        // Add the current phase to the execution plan
        executionPlan.push(nextPhase)
    }

    // If any nodes had invalid inputs, return a validation error with details
    if (inputsWithErrors.length > 0) {
        return {
            error: {
                type: FlowToExecutionPlanValidationError.INVALID_INPUTS,
                invalidElements: inputsWithErrors,
            },
        }
    }

    // Return the constructed execution plan
    return { executionPlan }
}


function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
    // Array to collect names of invalid (missing or unfulfilled) inputs for this node
    const invalidInputs = [];

    // Get the list of input definitions for this node type from the TaskRegistry
    const inputs = TaskRegistry[node.data.type].inputs;

    // Iterate over each input definition for the node
    for (const input of inputs) {
        // Get the value provided for this input (if any)
        const inputValue = node.data.inputs[input.name];
        // Check if a value is provided (non-empty)
        const inputValueProvided = inputValue?.length > 0;
        if (inputValueProvided) {
            // If the user has provided a value for this input, it's valid; skip to next input
            continue;
        }
        // If a value is not provided by the user, check if this input is linked to an output from another node
        const incomingEdges = edges.filter((edge) => edge.target === node.id);

        // Find if any incoming edge connects to this specific input handle
        const inputLinkedToOutput = incomingEdges.find((edge) => edge.targetHandle === input.name);

        // Check if the input is required, is linked to an output, and the source node of that output is already planned
        const requiredInputProvidedByVisitedOutput =
            input.required &&
            inputLinkedToOutput &&
            planned.has(inputLinkedToOutput.source);

        if (requiredInputProvidedByVisitedOutput) {
            // The input is required and a valid value is provided by a previously planned node; skip to next input
            continue;
        } else if (!input.required) {
            // If the input is not required, but is linked to an output, check if the output's source node is planned
            if (!inputLinkedToOutput) continue; // If not linked, skip (input is optional and not provided)

            if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
                // The output is providing a value to the input and the source node is planned; input is valid
                continue;
            }
        }

        // If none of the above conditions are met, this input is invalid (missing or not yet fulfilled)
        invalidInputs.push(input.name)

    }
    // Return the list of invalid input names for this node
    return invalidInputs
}


function getIncomers(node: AppNode, nodes: AppNode[], edges: Edge[]) {
    if (!node.id) {
        return [];
    }
    const incomersIds = new Set();
    edges.forEach((edge) => {
        if (edge.target === node.id) {
            incomersIds.add(edge.source);
        }
    })
    return nodes.filter((n) => incomersIds.has(n.id));
}