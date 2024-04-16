import * as fzstd from "fzstd";
import { Ajv, JSONSchemaType } from "ajv";
import { useState } from "react";
import "./App.css";
import { Trace } from "./tracer_types.js";
import tracerTypesSchemaJson from "./tracer_types_schema.json";
import { ViewingOptions, TraceViewer } from "./viewers.js";
import "./index.css";

const emptyTrace: Trace = { sub_filenames: [], declarations: [] };

const ajv = new Ajv();
const tracerTypesSchema: JSONSchemaType<Trace> = tracerTypesSchemaJson as any;
const validateTrace = ajv.compile(tracerTypesSchema);

export function App() {
    const [viewingOptions, setViewingOptions] = useState<ViewingOptions>({ printingVariant: "default_pretty", expandAll: false });
    const [trace, setTrace] = useState(emptyTrace);
    return (
        <div
            className="app"
            onDrop={event => {
                event.preventDefault();

                if (event.dataTransfer === null || event.dataTransfer.items.length === 0) {
                    return;
                }

                const file = event.dataTransfer.items[0];
                file
                    .getAsFile()
                    ?.arrayBuffer()
                    .then(buffer => {
                        try {
                            let decompressedBuffer = new Uint8Array(buffer);
                            if ((decompressedBuffer[0] | (decompressedBuffer[1] << 8) | (decompressedBuffer[2] << 16)) === 0x2fb528) {
                                decompressedBuffer = fzstd.decompress(decompressedBuffer);
                            }
                            const newTrace = JSON.parse(new TextDecoder("utf-8").decode(decompressedBuffer));
                            if (validateTrace(newTrace)) {
                                setTrace(newTrace);
                            } else {
                                alert("Trace validation failed");
                                console.error(validateTrace.errors);
                            }
                        } catch (e) {
                            alert("Trace parsing failed");
                            console.error(e);
                        }
                    });
            }}
            onDragOver={event => event.preventDefault()}
        >
            <form className="app_options" autoComplete="off">
                <label>
                    <span>Printing variant:</span>
                    <select
                        value={viewingOptions.printingVariant}
                        onChange={event => setViewingOptions({ ...viewingOptions, printingVariant: event.target.value as any })}
                    >
                        <option value="default">default</option>
                        <option value="full_path">full_path</option>
                        <option value="no_notations">no_notations</option>
                        <option value="low_level">low_level</option>
                        <option value="default_pretty">default_pretty</option>
                    </select>
                </label>
                <label>
                    <span>Expand all:</span>
                    <input
                        type="checkbox"
                        checked={viewingOptions.expandAll}
                        onChange={event => setViewingOptions({ ...viewingOptions, expandAll: event.target.checked })}
                    />
                </label>
            </form>
            <div className="app_trace">
                <TraceViewer viewingOptions={viewingOptions} trace={trace}></TraceViewer>
            </div>
        </div>
    );
}
