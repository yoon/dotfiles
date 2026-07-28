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
import { Box, Text, truncateToWidth, visibleWidth, wrapTextWithAnsi, type Component } from "@earendil-works/pi-tui";

// Collapse built-in tool rows. Both states share one green-band header line
// (▸ collapsed / ▾ expanded); expanded nests the full built-in output in the
// same band. Ctrl+O toggles (context/options.expanded drives it).
const EMPTY: Component = { render: () => [], invalidate() {} };

// Header line sized to the real terminal width, then colored. Collapsed
// truncates to one line, reserving room so `suffix` (the line count) always
// survives after the ellipsis; expanded wraps the whole command, no suffix.
class HeaderLine implements Component {
  constructor(
    private readonly raw: string,
    private readonly color: (t: string) => string,
    private readonly wrap = false,
    private readonly suffix = "",
  ) {}
  render(width: number): string[] {
    if (this.wrap) return wrapTextWithAnsi(this.raw, width).map((l) => this.color(l));
    // truncateToWidth injects \e[0m resets around the ellipsis; left in place
    // they'd terminate the band's bg mid-line. raw is plain, so strip ANSI from
    // the truncated head and color the composed line once — bg then covers all.
    const head = truncateToWidth(this.raw, Math.max(0, width - visibleWidth(this.suffix)), "…").replace(
      /\x1b\[[0-9;]*m/g,
      "",
    );
    return [this.color(head + this.suffix)];
  }
  invalidate() {}
}

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
        // "self" skips the shell's padded Box + Spacer so our own full-width
        // band owns the row in both states.
        renderShell: "self",
        // We render the command ourselves in the band header, so the shell's
        // separate command line (base.renderCall) is always suppressed —
        // keeping the command inside the green box in both states.
        renderCall() {
          return EMPTY;
        },
        renderResult(result, options, theme, context) {
          const bgName = context.isError ? "toolErrorBg" : "toolSuccessBg";
          const band = new Box(1, 0, (t: string) => theme.bg(bgName, t));
          const fg = context.isError ? "error" : "toolOutput";

          const args = (context.args ?? {}) as Record<string, unknown>;
          const hint = (args.command ?? args.path ?? args.pattern ?? args.query ?? "") as string;
          const cmd = hint.replace(/\s+/g, " ").trim();
          const text = result.content.map((c) => (c.type === "text" ? c.text : "")).join("\n");
          const lines = text ? text.split("\n").length : 0;
          // Line count only when collapsed (expanded shows the output itself).
          const count = !options.expanded && lines > 1 ? ` (${lines} lines)` : "";
          // ▸ collapsed, ▾ expanded — first line is otherwise identical.
          const tri = options.expanded ? "▾" : "▸";
          const header = `${tri} ${name}${cmd ? ` · ${cmd}` : ""}`;
          band.addChild(new HeaderLine(header, (t) => theme.fg(fg, t), options.expanded, count));

          if (options.expanded) {
            const inner =
              base.renderResult?.(result, options, theme, { ...context, lastComponent: undefined }) ??
              new Text("", 0, 0);
            band.addChild(inner);
          }
          return band;
        },
      });
    }
  });
}
