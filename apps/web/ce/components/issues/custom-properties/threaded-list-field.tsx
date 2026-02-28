import React, { useState } from "react";
import { Plus, MessageCircle } from "lucide-react";
import { Button, Input } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Reply = { text: string; author?: string; at: string };
type ThreadItem = { text: string; replies: Reply[] };

type Props = {
  property: TIssueTypeProperty;
  value: ThreadItem[];
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const ThreadedListField: React.FC<Props> = ({ property, value, onChange, disabled }) => {
  const items: ThreadItem[] = value ?? [];
  const [newItem, setNewItem] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const addItem = () => {
    if (!newItem.trim()) return;
    onChange({ items: [...items, { text: newItem.trim(), replies: [] }] });
    setNewItem("");
  };

  const addReply = (idx: number) => {
    if (!replyText.trim()) return;
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      return {
        ...item,
        replies: [...item.replies, { text: replyText.trim(), at: new Date().toISOString() }],
      };
    });
    onChange({ items: updated });
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="rounded border border-subtle-1 p-2">
          <p className="text-13 text-primary">{item.text}</p>
          {item.replies.length > 0 && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-subtle-1 pl-2">
              {item.replies.map((reply, ri) => (
                <p key={ri} className="text-11 text-tertiary">
                  {reply.text}
                  <span className="ml-1 text-placeholder">
                    {new Date(reply.at).toLocaleDateString()}
                  </span>
                </p>
              ))}
            </div>
          )}
          {!disabled && (
            <>
              {replyingTo === idx ? (
                <div className="flex items-center gap-1 mt-1 ml-4">
                  <Input
                    type="text"
                    mode="transparent"
                    inputSize="xs"
                    className="flex-1"
                    placeholder="Reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addReply(idx);
                      }
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setReplyingTo(idx)}
                  className="mt-1 flex items-center gap-1 text-11 text-placeholder hover:text-accent-primary"
                >
                  <MessageCircle className="h-3 w-3" /> Reply
                </button>
              )}
            </>
          )}
        </div>
      ))}
      {!disabled && (
        <div className="flex items-center gap-1">
          <Input
            type="text"
            mode="transparent"
            inputSize="xs"
            className="flex-1"
            placeholder={`Add ${property.name.toLowerCase()}...`}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <Button
            variant="accent-primary"
            size="sm"
            onClick={addItem}
            className="flex-shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
