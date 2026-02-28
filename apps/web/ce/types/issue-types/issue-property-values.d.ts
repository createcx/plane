export type TFieldType =
  | "text"
  | "rich_text"
  | "url"
  | "enum"
  | "float"
  | "integer"
  | "boolean"
  | "checklist"
  | "array_user_ids"
  | "currency"
  | "tags"
  | "threaded_list"
  | "timestamped_text"
  | "json";

export type TPropertyCategory = "data" | "tracking" | "criteria" | "governance" | "hitl";

export type TIssueTypeProperty = {
  id: string;
  issue_type: string;
  name: string;
  key: string;
  description: string;
  field_type: TFieldType;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  config: Record<string, any>;
  maps_to_builtin: string;
  category: TPropertyCategory;
  created_at: string;
  updated_at: string;
};

export type TIssuePropertyValue = {
  id: string;
  issue: string;
  property: string;
  property_detail: TIssueTypeProperty;
  value_json: Record<string, any>;
  created_at: string;
  updated_at: string;
};

/** Map of property_id -> value_json for bulk operations */
export type TIssuePropertyValues = Record<string, Record<string, any>>;

export type TIssuePropertyValueErrors = Record<string, string>;
