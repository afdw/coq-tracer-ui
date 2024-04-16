export type FullPath = string;

export type Reference = { type: "Const"; path: FullPath } | { type: "Ind"; path: FullPath } | { type: "Construct"; ind_path: FullPath; path: FullPath };

export type PrintingVariants = {
    default: string;
    full_path: string;
    no_notations: string;
    low_level: string;
    default_pretty: string;
    references: Reference[];
};

export type HypKind = { type: "Assumption" } | { type: "Definition"; value: PrintingVariants };

export type Hyp = {
    name: string;
    type_: PrintingVariants;
    kind: HypKind;
};

export type Goal = {
    hyps: Hyp[];
    concl: PrintingVariants;
};

export type TacticKind = { type: "Primitive"; s: string } | { type: "Builtin"; s: string } | { type: "Alias"; s: string } | { type: "ML"; s: string };

export type Event_ =
    | { type: "Sequence"; elements: Event_[] }
    | { type: "Dispatch"; goals_before: Goal[]; branches: Event_[] }
    | { type: "Tactic"; goals_before: Goal[]; goals_after: Goal[]; kind: TacticKind; tactic: PrintingVariants; details: Event_ }
    | { type: "Message"; message: string };

export type StepKind =
    | {
          type: "Tactic";
          goal_selector: string;
          tactic_raw: string;
          tactic: PrintingVariants;
          event: Event_;
      }
    | { type: "StartSubproof" }
    | { type: "EndSubproof" }
    | { type: "Bullet"; bullet: string };

export type Step = {
    goals_before: Goal[];
    goals_after: Goal[];
    kind: StepKind;
};

export type Outcome = { type: "Admitted" } | { type: "Proved" } | { type: "Exact" } | { type: "Abort" } | { type: "Fail" };

export type DeclarationKind =
    | { type: "Inductive" }
    | { type: "Constructor"; ind_path: FullPath }
    | { type: "Assumption" }
    | { type: "Assumption" }
    | {
          type: "Definition";
          value: PrintingVariants;
          equations: PrintingVariants[];
      }
    | {
          type: "Interactive";
          steps: Step[];
          outcome: Outcome;
      };

export type Declaration = {
    path: FullPath;
    type_: PrintingVariants;
    kind: DeclarationKind;
};

export type Trace = {
    sub_filenames: string[];
    declarations: Declaration[];
};
