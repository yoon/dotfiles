import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  createBashToolDefinition,
  createEditToolDefinition,
  createFindToolDefinition,
  createGrepToolDefinition,
  createLsToolDefinition,
  createReadToolDefinition,
  createWriteToolDefinition,
} from "@earendil-works/pi-coding-agent";
import { Box, Text, type Component } from "@earendil-works/pi-tui";

// Collapse built-in tool rows to one summary line. Ctrl+O expands to the full
// built-in view (context.expanded drives it).
const EMPTY: Component = { render: () => [], invalidate() {} };

const FACTORIES = {
  read: createReadToolDefinition,
  bash: createBashToolDefinition,
  edit: createEditToolDefinition,
  write: createWriteToolDefinition,
  grep: createGrepToolDefinition,
  find: createFindToolDefinition,
  ls: createLsToolDefinition,
} as const;

export default function collapseToolOutput(pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    for (const [name, make] of Object.entries(FACTORIES)) {
      const base = make(ctx.cwd);
      pi.registerTool({
        ...base,
        // "self" skips the shell's padded Box + Spacer. We supply our own
        // Box(1, 0, bgFn): full-width success/error band, zero vertical padding,
        // so rows stay compact AND colored in both collapsed and expanded states.
        renderShell: "self",
        renderCall(args, theme, context) {
          // Delegate with a clean lastComponent: we wrap results in our own Box,
          // so the shell's cached lastComponent isn't base's expected type.
          return context.expanded
            ? base.renderCall?.(args, theme, { ...context, lastComponent: undefined }) ?? EMPTY
            : EMPTY;
        },
        renderResult(result, options, theme, context) {
          const bgName = context.isError ? "toolErrorBg" : "toolSuccessBg";
          const band = new Box(1, 0, (t: string) => theme.bg(bgName, t));
          if (options.expanded) {
            const inner =
              base.renderResult?.(result, options, theme, { ...context, lastComponent: undefined }) ??
              new Text("", 0, 0);
            band.addChild(inner);
            return band;
          }
          const args = (context.args ?? {}) as Record<string, unknown>;
          const hint = (args.command ?? args.path ?? args.pattern ?? args.query ?? "") as string;
          const snippet = hint ? ` · ${hint.replace(/\s+/g, " ").slice(0, 40)}` : "";
          const text = result.content.map((c) => (c.type === "text" ? c.text : "")).join("\n");
          const lines = text ? text.split("\n").length : 0;
          const count = lines > 1 ? ` (${lines} lines)` : "";
          // ▸ = disclosure triangle: this row is collapsed, Ctrl+O expands it.
          const fg = context.isError ? "error" : "toolOutput";
          band.addChild(new Text(theme.fg(fg, `▸ ${name}${snippet}${count}`), 0, 0));
          return band;
        },
      });
    }
  });
}
