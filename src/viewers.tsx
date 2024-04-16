import { useState } from "react";
import { PrintingVariants, Event_, Step, Declaration, Trace } from "./tracer_types.js";
import "./viewers.css";

export type ViewingOptions = {
    printingVariant: "default" | "full_path" | "no_notations" | "low_level" | "default_pretty";
    expandAll: boolean;
};

export function getPrintingVariant(viewingOptions: ViewingOptions, printingVariants: PrintingVariants) {
    return printingVariants[viewingOptions.printingVariant];
}

export function EventViewer({ viewingOptions, depth, event }: { viewingOptions: ViewingOptions; depth: number; event: Event_ }) {
    switch (event.type) {
        case "Sequence":
            return (
                <table className="event event-sequence">
                    <tbody>
                        <tr>
                            {event.elements.map((event, i) => (
                                <td key={i}>
                                    <EventViewer viewingOptions={viewingOptions} depth={depth} event={event}></EventViewer>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            );
        case "Dispatch":
            return (
                <table className="event event-dispatch">
                    <tbody>
                        {event.branches.map((event, i) => (
                            <tr key={i}>
                                <td>
                                    <EventViewer viewingOptions={viewingOptions} depth={depth} event={event}></EventViewer>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        case "Tactic":
            const empty = event.details.type === "Sequence" && event.details.elements.length === 0;
            const [expand, setExpand] = useState(depth < 15 || empty);
            return (
                <table className={"event event-tactic" + (depth >= 10 ? " event-tactic-deep" : "")}>
                    <tbody>
                        <tr
                            onClick={event => {
                                if (!viewingOptions.expandAll && !event.altKey) {
                                    setExpand(!expand || empty);
                                }
                            }}
                        >
                            <th title={`${event.kind.type} ${JSON.stringify(event.kind.s)}`}>
                                <pre>{getPrintingVariant(viewingOptions, event.tactic)}</pre>
                            </th>
                        </tr>
                        <tr>
                            <td>
                                {expand || viewingOptions.expandAll ? (
                                    <EventViewer viewingOptions={viewingOptions} depth={depth + 1} event={event.details}></EventViewer>
                                ) : (
                                    <i>{"<collapsed>"}</i>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        case "Message":
            return (
                <table className="event event-message">
                    <tbody>
                        <tr>
                            <td>
                                (﹡<code>{event.message}</code>﹡)
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        default:
            event satisfies never;
            throw new Error("Not exhaustive");
    }
}

export function StepViewer({ viewingOptions, step }: { viewingOptions: ViewingOptions; step: Step }) {
    switch (step.kind.type) {
        case "Tactic":
            return (
                <div className="step step-tactic">
                    <details>
                        <summary>
                            <pre>{step.kind.goal_selector}</pre>:&nbsp;<pre>{getPrintingVariant(viewingOptions, step.kind.tactic)}</pre>.
                        </summary>
                        <div className="step-tactic_event">
                            <EventViewer viewingOptions={viewingOptions} depth={0} event={step.kind.event}></EventViewer>
                        </div>
                    </details>
                </div>
            );
        case "StartSubproof":
            return (
                <div className="step step-start-subproof">
                    <code>{"{"}</code>
                </div>
            );
        case "EndSubproof":
            return (
                <div className="step step-end-subproof">
                    <code>{"}"}</code>
                </div>
            );
        case "Bullet":
            return (
                <div className="step step-bullet">
                    <code>{step.kind.bullet}</code>
                </div>
            );
        default:
            step.kind satisfies never;
            throw new Error("Not exhaustive");
    }
}

export function DeclarationViewer({ viewingOptions, declaration }: { viewingOptions: ViewingOptions; declaration: Declaration }) {
    switch (declaration.kind.type) {
        case "Inductive":
            return (
                <div className="declaration declaration-inductive">
                    <div className="declaration_body">
                        <span className="keyword">Inductive</span> <code>{declaration.path}</code> :{" "}
                        <code>{getPrintingVariant(viewingOptions, declaration.type_)}</code>.
                    </div>
                </div>
            );
        case "Constructor":
            return (
                <div className="declaration declaration-constructor">
                    <div className="declaration_body">
                        <span className="keyword">Constructor</span> <code>{declaration.path}</code> ∈ <code>{declaration.kind.ind_path}</code> :{" "}
                        <code>{getPrintingVariant(viewingOptions, declaration.type_)}</code>.
                    </div>
                </div>
            );
        case "Assumption":
            return (
                <div className="declaration declaration-assumption">
                    <div className="declaration_body">
                        <span className="keyword">Axiom</span> <code>{declaration.path}</code> :{" "}
                        <code>{getPrintingVariant(viewingOptions, declaration.type_)}</code>.
                    </div>
                </div>
            );
        case "Definition":
            return (
                <div className="declaration declaration-definition">
                    <div className="declaration_body">
                        <span className="keyword">Definition</span> <code>{declaration.path}</code> :{" "}
                        <code>{getPrintingVariant(viewingOptions, declaration.type_)}</code> :=
                        <br></br>
                        <span className="declaration-definition_value">
                            <code>{getPrintingVariant(viewingOptions, declaration.kind.value)}</code>
                        </span>
                        .
                        <ol className="declaration-definition_equations">
                            {declaration.kind.equations.map((equation, i) => (
                                <li key={i}>
                                    <code>{getPrintingVariant(viewingOptions, equation)}</code>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            );
        case "Interactive":
            return (
                <div className="declaration declaration-interactive">
                    <div className="declaration_body">
                        <span className="keyword">Theorem</span> <code>{declaration.path}</code> :{" "}
                        <code>{getPrintingVariant(viewingOptions, declaration.type_)}</code>.
                        <ol className="declaration-interactive_steps">
                            {declaration.kind.steps.map((step, i) => (
                                <li key={i}>
                                    <StepViewer viewingOptions={viewingOptions} step={step}></StepViewer>
                                </li>
                            ))}
                        </ol>
                        {(() => {
                            switch (declaration.kind.outcome.type) {
                                case "Admitted":
                                    return (
                                        <>
                                            <span className="keyword">Admitted</span>.
                                        </>
                                    );
                                case "Proved":
                                    return (
                                        <>
                                            <span className="keyword">Qed</span>.
                                        </>
                                    );
                                case "Exact":
                                    return (
                                        <>
                                            <span className="keyword">Exact</span>.
                                        </>
                                    );
                                case "Abort":
                                    return (
                                        <>
                                            <span className="keyword">Abort</span>.
                                        </>
                                    );
                                case "Fail":
                                    return (
                                        <>
                                            <span className="keyword">Fail</span>.
                                        </>
                                    );
                                default:
                                    declaration.kind.outcome satisfies never;
                                    throw new Error("Not exhaustive");
                            }
                        })()}
                    </div>
                </div>
            );
        default:
            declaration.kind satisfies never;
            throw new Error("Not exhaustive");
    }
}

export function TraceViewer({ viewingOptions, trace }: { viewingOptions: ViewingOptions; trace: Trace }) {
    const pathsUsages = new Map<string, number>();
    return (
        <div className={"trace" + (viewingOptions.printingVariant == "default_pretty" ? " trace-pretty" : "")}>
            {trace.declarations.map(declaration => {
                let usages = pathsUsages.get(declaration.path) ?? 0;
                pathsUsages.set(declaration.path, usages + 1);
                return <DeclarationViewer viewingOptions={viewingOptions} key={`${declaration.path}#${usages}`} declaration={declaration}></DeclarationViewer>;
            })}
        </div>
    );
}
