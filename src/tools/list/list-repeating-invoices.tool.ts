import { z } from "zod";
import { listXeroRepeatingInvoices } from "../../handlers/list-xero-repeating-invoices.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";
import { formatLineItem } from "../../helpers/format-line-item.js";

const ListRepeatingInvoicesTool = CreateXeroTool(
  "list-repeating-invoices",
  "List repeating (recurring) invoices in Xero. Returns all repeating invoice templates \
  including their schedule, contact, line items, and status. \
  Optionally filter by status (DRAFT, AUTHORISED) or type (ACCPAY, ACCREC). \
  Use this to understand recurring billing, subscriptions, and regular payments.",
  {
    where: z
      .string()
      .optional()
      .describe(
        'Optional filter expression, e.g. Status=="AUTHORISED" or Type=="ACCREC"',
      ),
    order: z
      .string()
      .optional()
      .describe(
        'Optional ordering, e.g. "Total DESC" or "Contact.Name ASC"',
      ),
  },
  async ({ where, order }) => {
    const response = await listXeroRepeatingInvoices(where, order);
    if (response.error !== null) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing repeating invoices: ${response.error}`,
          },
        ],
      };
    }

    const repeatingInvoices = response.result;

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${repeatingInvoices?.length || 0} repeating invoices:`,
        },
        ...(repeatingInvoices?.map((invoice) => ({
          type: "text" as const,
          text: [
            `Repeating Invoice ID: ${invoice.repeatingInvoiceID}`,
            `Type: ${invoice.type || "Unknown"}`,
            `Status: ${invoice.status || "Unknown"}`,
            invoice.contact
              ? `Contact: ${invoice.contact.name} (${invoice.contact.contactID})`
              : null,
            invoice.reference ? `Reference: ${invoice.reference}` : null,
            invoice.schedule
              ? [
                  `Schedule: Every ${invoice.schedule.period} ${invoice.schedule.unit}`,
                  invoice.schedule.startDate
                    ? `  Start Date: ${invoice.schedule.startDate}`
                    : null,
                  invoice.schedule.nextScheduledDate
                    ? `  Next Scheduled: ${invoice.schedule.nextScheduledDate}`
                    : null,
                  invoice.schedule.endDate
                    ? `  End Date: ${invoice.schedule.endDate}`
                    : null,
                  invoice.schedule.dueDate !== undefined
                    ? `  Due Date: ${invoice.schedule.dueDate} (${invoice.schedule.dueDateType})`
                    : null,
                ]
                  .filter(Boolean)
                  .join("\n")
              : null,
            invoice.lineAmountTypes
              ? `Line Amount Types: ${invoice.lineAmountTypes}`
              : null,
            invoice.subTotal !== undefined
              ? `Sub Total: ${invoice.subTotal}`
              : null,
            invoice.totalTax !== undefined
              ? `Total Tax: ${invoice.totalTax}`
              : null,
            `Total: ${invoice.total || 0}`,
            invoice.currencyCode ? `Currency: ${invoice.currencyCode}` : null,
            invoice.approvedForSending
              ? "Approved For Sending: Yes"
              : null,
            invoice.sendCopy ? "Send Copy: Yes" : null,
            invoice.markAsSent ? "Mark As Sent: Yes" : null,
            invoice.includePDF ? "Include PDF: Yes" : null,
            invoice.lineItems
              ? `Line Items:\n${invoice.lineItems.map(formatLineItem).join("\n")}`
              : null,
          ]
            .filter(Boolean)
            .join("\n"),
        })) || []),
      ],
    };
  },
);

export default ListRepeatingInvoicesTool;
