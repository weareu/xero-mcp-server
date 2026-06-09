import { LineItem, LineItemTracking } from "xero-node";

// Render line-item tracking as readable "Category=Option" pairs.
// Without this, `${lineItem.tracking}` stringifies the array of objects to
// "[object Object]", destroying the tracking category/option names (e.g. the
// Product=OpenItem3 tag) before they ever reach the caller.
const formatTracking = (tracking?: LineItemTracking[]): string => {
  if (!tracking || tracking.length === 0) return "None";
  return tracking
    .map((t) => `${t.name ?? "?"}=${t.option ?? "?"}`)
    .join(", ");
};

export const formatLineItem = (lineItem: LineItem): string => {
  return [
    `Item ID: ${lineItem.item}`,
    `Item Code: ${lineItem.itemCode}`,
    `Description: ${lineItem.description}`,
    `Quantity: ${lineItem.quantity}`,
    `Unit Amount: ${lineItem.unitAmount}`,
    `Account Code: ${lineItem.accountCode}`,
    `Tax Type: ${lineItem.taxType}`,
    `Tracking: ${formatTracking(lineItem.tracking)}`,
    `Line Amount: ${lineItem.lineAmount}`,
  ].join("\n");
};
