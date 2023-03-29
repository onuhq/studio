export interface Field {
  name: string;
  type: "string" | "text" | "number" | "boolean" | "select" | "csv";
  description?: string;
  options?: Array<string>;
  required?: boolean;
}
export type IndexedField = Record<string, Field>
export interface Task {
  name: string
  description: string
  slug: string
  input: IndexedField
  owner?: string
}

export interface Execution {
  taskSlug: string;
  eid: string;
  input: Record<string, any>;
  returnValue?: Record<string, any>;
  status: ExecutionStatus;
  createdAt: Date;
  task?: Task;
}

export type ExecutionStatus = "running" | "success" | "fail" | "enqueued";
