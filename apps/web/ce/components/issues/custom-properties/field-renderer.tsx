import React from "react";
import type { TIssueTypeProperty, TFieldType } from "@/plane-web/types/issue-types/issue-property-values";
import { TextField } from "./text-field";
import { RichTextField } from "./rich-text-field";
import { UrlField } from "./url-field";
import { EnumField } from "./enum-field";
import { FloatField } from "./float-field";
import { BooleanField } from "./boolean-field";
import { ChecklistField } from "./checklist-field";
import { UserSelectField } from "./user-select-field";
import { CurrencyField } from "./currency-field";
import { TagsField } from "./tags-field";
import { ThreadedListField } from "./threaded-list-field";
import { TimestampedTextField } from "./timestamped-text-field";
import { JsonField } from "./json-field";

type Props = {
  property: TIssueTypeProperty;
  valueJson: Record<string, any>;
  onChange: (propertyId: string, val: Record<string, any>) => void;
  disabled?: boolean;
  workspaceSlug?: string;
};

/**
 * Extract the display value from value_json based on field_type.
 * Different field types store values in different shapes.
 */
function extractValue(fieldType: TFieldType, valueJson: Record<string, any>): any {
  if (!valueJson || Object.keys(valueJson).length === 0) return undefined;

  switch (fieldType) {
    case "checklist":
      return valueJson.items ?? [];
    case "threaded_list":
      return valueJson.items ?? [];
    case "timestamped_text":
      return valueJson.entries ?? [];
    case "json":
      return valueJson.value ?? null;
    default:
      return valueJson.value ?? undefined;
  }
}

export const FieldRenderer: React.FC<Props> = ({ property, valueJson, onChange, disabled, workspaceSlug }) => {
  const val = extractValue(property.field_type, valueJson);
  const handleChange = (newVal: Record<string, any>) => onChange(property.id, newVal);

  switch (property.field_type) {
    case "text":
      return <TextField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "rich_text":
      return <RichTextField property={property} value={val} onChange={handleChange} disabled={disabled} workspaceSlug={workspaceSlug ?? ""} />;
    case "url":
      return <UrlField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "enum":
      return <EnumField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "float":
    case "integer":
      return <FloatField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "boolean":
      return <BooleanField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "checklist":
      return <ChecklistField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "array_user_ids":
      return <UserSelectField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "currency":
      return <CurrencyField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "tags":
      return <TagsField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "threaded_list":
      return <ThreadedListField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "timestamped_text":
      return <TimestampedTextField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    case "json":
      return <JsonField property={property} value={val} onChange={handleChange} disabled={disabled} />;
    default:
      return <p className="text-11 text-placeholder">Unsupported field type: {property.field_type}</p>;
  }
};
