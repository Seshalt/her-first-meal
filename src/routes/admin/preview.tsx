import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, Image as ImageIcon, Link2, MousePointer2, RefreshCcw, Save, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  adminGetVisualOverrides,
  adminSaveVisualOverride,
  type VisualOverrideKind,
} from "@/lib/server/visual-overrides";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/preview")({ component: WebsiteCanvas });

const PAGES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/pricing", label: "Membership" },
  { path: "/belly-binding", label: "Belly binding" },
  { path: "/doula", label: "Doula care" },
  { path: "/contact", label: "Contact" },
  { path: "/privacy", label: "Privacy" },
  { path: "/terms", label: "Terms" },
  { path: "/cookies", label: "Cookies" },
  { path: "/accessibility", label: "Accessibility" },
] as const;

type Selection = {
  selector: string;
  tag: string;
  kind: VisualOverrideKind;
  value: string;
  alt: string;
  label: string;
};

function candidateFrom(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const candidate = target.closest<HTMLElement>("img") ?? target.closest<HTMLElement>("a") ?? target.closest<HTMLElement>("h1,h2,h3,h4,h5,h6,p,button,span,strong,em,li");
  if (!candidate || candidate.closest("[data-hfm-editor-ignore]")) return null;
  return candidate;
}

function escapeCss(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

function selectorFor(element: HTMLElement) {
  if (element.id) return `#${escapeCss(element.id)}`;

  const parts: string[] = [];
  let node: HTMLElement | null = element;
  while (node && node.tagName !== "BODY") {
    const tag = node.tagName;
    let part = tag.toLowerCase();
    const stableClass = [...node.classList].find(
      (name) =>
        (/^(hfm|room|public|price|feature|hero|site)/.test(name) || name.includes("title") || name.includes("copy")) &&
        !name.includes(":") &&
        !name.includes("[") &&
        !name.startsWith("is-"),
    );
    if (stableClass) part += `.${escapeCss(stableClass)}`;

    const parentElement: HTMLElement | null = node.parentElement;
    if (parentElement) {
      const siblings = [...parentElement.children].filter((child) => child.tagName === tag);
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    }

    parts.unshift(part);
    if (stableClass && parts.length >= 2) break;
    node = parentElement;
    if (parts.length >= 7) break;
  }
  return parts.join(" > ");
}

function selectionFrom(element: HTMLElement): Selection {
  const tag = element.tagName.toLowerCase();
  const text = element instanceof HTMLImageElement ? element.alt : element.innerText.trim();
  const label = `${tag.toUpperCase()} · ${text.slice(0, 58) || "untitled element"}`;

  if (element instanceof HTMLImageElement) {
    return {
      selector: selectorFor(element),
      tag,
      kind: "image",
      value: element.currentSrc || element.src,
      alt: element.alt,
      label,
    };
  }

  return {
    selector: selectorFor(element),
    tag,
    kind: "text",
    value: element.innerText.trim(),
    alt: "",
    label,
  };
}

function WebsiteCanvas() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [page, setPage] = useState("/");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [frameKey, setFrameKey] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void adminGetVisualOverrides({ data: { page } })
      .then((overrides) => setSavedCount(Object.keys(overrides).length))
      .catch(() => setSavedCount(0));
  }, [page, frameKey]);

  useEffect(() => () => cleanupRef.current?.(), []);

  function wireFrame() {
    cleanupRef.current?.();
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;

    const style = doc.createElement("style");
    style.dataset.hfmEditorIgnore = "true";
    style.textContent = `
      [data-hfm-editor-hover="true"] { outline: 2px solid #e7ad3d !important; outline-offset: 4px !important; cursor: pointer !important; }
      [data-hfm-editor-selected="true"] { outline: 3px solid #40b9a4 !important; outline-offset: 5px !important; }
      body::after {
        content: "Visual editor · click, right-click, or hold an element";
        position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;
        background: rgba(7,17,14,.94); color: #fff8ed; border: 1px solid rgba(255,255,255,.16);
        border-radius: 999px; padding: 10px 14px; font: 600 11px/1 system-ui, sans-serif;
        letter-spacing: .08em; text-transform: uppercase; box-shadow: 0 12px 36px rgba(0,0,0,.28);
        pointer-events: none;
      }
    `;
    doc.head.appendChild(style);

    let hovered: HTMLElement | null = null;
    let selected: HTMLElement | null = null;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let suppressClick = false;
    let holdTarget: HTMLElement | null = null;
    let holdStart = { x: 0, y: 0 };
    const menu = doc.createElement("button");
    menu.type = "button";
    menu.textContent = "Edit this element";
    menu.dataset.hfmEditorIgnore = "true";
    menu.style.cssText = "position:fixed;z-index:2147483647;display:none;padding:10px 14px;border:0;border-radius:999px;background:#10281f;color:#fff8ed;font:600 13px system-ui;box-shadow:0 12px 36px #0005;cursor:pointer";
    doc.body.appendChild(menu);

    const clearHover = () => {
      hovered?.removeAttribute("data-hfm-editor-hover");
      hovered = null;
    };

    const onMove = (event: MouseEvent) => {
      const next = candidateFrom(event.target);
      if (next === hovered) return;
      clearHover();
      hovered = next;
      hovered?.setAttribute("data-hfm-editor-hover", "true");
    };

    const select = (next: HTMLElement) => {
      menu.style.display = "none";
      selected?.removeAttribute("data-hfm-editor-selected");
      selected = next;
      selected.setAttribute("data-hfm-editor-selected", "true");
      setSelection(selectionFrom(selected));
      if (window.innerWidth < 1280) inspectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const stopHold = () => {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
      holdTarget = null;
    };

    const offerEdit = (next: HTMLElement, x: number, y: number) => {
      selected?.removeAttribute("data-hfm-editor-selected");
      selected = next;
      selected.setAttribute("data-hfm-editor-selected", "true");
      const width = doc.defaultView?.innerWidth ?? 390;
      const height = doc.defaultView?.innerHeight ?? 720;
      menu.style.left = `${Math.max(8, Math.min(x, width - 170))}px`;
      menu.style.top = `${Math.max(8, Math.min(y + 12, height - 55))}px`;
      menu.style.display = "block";
    };

    const onClick = (event: MouseEvent) => {
      if (event.target === menu) return;
      if (suppressClick && event.target instanceof Node && selected?.contains(event.target)) {
        suppressClick = false;
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      suppressClick = false;
      const next = candidateFrom(event.target);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      select(next);
    };

    const onPointerDown = (event: PointerEvent) => {
      stopHold();
      if (event.button !== 0) return;
      holdTarget = candidateFrom(event.target);
      if (!holdTarget) return;
      holdStart = { x: event.clientX, y: event.clientY };
      holdTimer = setTimeout(() => {
        if (holdTarget) {
          suppressClick = true;
          offerEdit(holdTarget, holdStart.x, holdStart.y);
        }
        stopHold();
      }, 550);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - holdStart.x, event.clientY - holdStart.y) > 12) stopHold();
    };
    const onContextMenu = (event: MouseEvent) => {
      const next = candidateFrom(event.target);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      stopHold();
      offerEdit(next, event.clientX, event.clientY);
    };
    const onMenuClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (selected) select(selected);
    };
    menu.addEventListener("click", onMenuClick);

    doc.addEventListener("mousemove", onMove, true);
    doc.addEventListener("mouseleave", clearHover, true);
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("pointermove", onPointerMove, true);
    doc.addEventListener("pointerup", stopHold, true);
    doc.addEventListener("pointercancel", stopHold, true);
    doc.addEventListener("contextmenu", onContextMenu, true);

    cleanupRef.current = () => {
      stopHold();
      clearHover();
      selected?.removeAttribute("data-hfm-editor-selected");
      doc.removeEventListener("mousemove", onMove, true);
      doc.removeEventListener("mouseleave", clearHover, true);
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("pointermove", onPointerMove, true);
      doc.removeEventListener("pointerup", stopHold, true);
      doc.removeEventListener("pointercancel", stopHold, true);
      doc.removeEventListener("contextmenu", onContextMenu, true);
      menu.removeEventListener("click", onMenuClick);
      menu.remove();
      style.remove();
    };
  }

  function preview(next: Selection) {
    setSelection(next);
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    let element: Element | null = null;
    try {
      element = doc.querySelector(next.selector);
    } catch {
      return;
    }
    if (!element) return;

    if (next.kind === "image" && element instanceof HTMLImageElement) {
      element.src = next.value;
      element.alt = next.alt;
    } else if (next.kind === "link" && element instanceof HTMLAnchorElement) {
      element.href = next.value;
    } else {
      element.textContent = next.value;
    }
  }

  async function save() {
    if (!selection) return;
    setBusy(true);
    try {
      await adminSaveVisualOverride({
        data: {
          page,
          selector: selection.selector,
          kind: selection.kind,
          value: selection.value,
          alt: selection.alt,
        },
      });
      const overrides = await adminGetVisualOverrides({ data: { page } });
      setSavedCount(Object.keys(overrides).length);
      toast.success("That element is live.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that edit.");
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!selection) return;
    setBusy(true);
    try {
      await adminSaveVisualOverride({
        data: { page, selector: selection.selector, kind: selection.kind, reset: true },
      });
      setSelection(null);
      setFrameKey((value) => value + 1);
      toast.success("Element reset.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reset that edit.");
    } finally {
      setBusy(false);
    }
  }

  function switchLinkMode(kind: "text" | "link") {
    if (!selection || selection.tag !== "a") return;
    if (kind === "text") {
      const element = frameRef.current?.contentDocument?.querySelector(selection.selector);
      const text = element instanceof HTMLAnchorElement ? element.innerText.trim() : selection.value;
      preview({ ...selection, kind, value: text });
      return;
    }
    const element = frameRef.current?.contentDocument?.querySelector(selection.selector);
    const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") ?? "/" : "/";
    preview({ ...selection, kind, value: href });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#d3a34d]">Website studio</p>
          <h1 className="mt-2 font-display text-4xl">Edit the real page, not a list of fields.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            Click, right-click, or press and hold text or an image. Choose “Edit this element,” change it in the inspector, and save it live.
          </p>
        </div>
        <a href={page} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:bg-white/8 hover:text-white">
          Open page <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className="mt-7 overflow-hidden rounded-[28px] border border-white/10 bg-[#07110e] shadow-[0_28px_90px_rgba(0,0,0,.28)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[.035] px-4 py-3">
          <div className="flex items-center gap-2">
            <MousePointer2 className="size-4 text-[#d3a34d]" />
            <div>
              <p className="text-sm font-medium text-[#fff8ed]">Live visual canvas</p>
              <p className="text-[11px] text-white/45">{savedCount} saved edit{savedCount === 1 ? "" : "s"} on this page</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/7 p-1">
              <button type="button" className={cn("rounded-full px-3 py-1.5 text-xs", viewport === "desktop" ? "bg-[#fff8ed] text-[#10281f]" : "text-white/60")} onClick={() => setViewport("desktop")}>
                Desktop
              </button>
              <button type="button" className={cn("rounded-full px-3 py-1.5 text-xs", viewport === "mobile" ? "bg-[#fff8ed] text-[#10281f]" : "text-white/60")} onClick={() => setViewport("mobile")}>
                Mobile
              </button>
            </div>
            <button type="button" aria-label="Reload preview" className="grid size-9 place-items-center rounded-full bg-white/7 text-white/70 hover:bg-white/12" onClick={() => setFrameKey((value) => value + 1)}>
              <RefreshCcw className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid min-h-[760px] xl:grid-cols-[210px_minmax(0,1fr)_330px]">
          <aside className="border-b border-white/10 p-3 xl:border-b-0 xl:border-r">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Pages</p>
            <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-1">
              {PAGES.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={cn("rounded-xl px-3 py-2.5 text-left text-sm transition", page === item.path ? "bg-[#2f8478] text-white" : "text-white/60 hover:bg-white/7 hover:text-white")}
                  onClick={() => {
                    cleanupRef.current?.();
                    setSelection(null);
                    setPage(item.path);
                    setFrameKey((value) => value + 1);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="overflow-auto bg-[radial-gradient(circle_at_50%_0%,rgba(211,163,77,.10),transparent_30%),#0b1411] p-3 sm:p-5">
            <div
              className="mx-auto h-[720px] overflow-hidden rounded-[22px] border border-white/10 bg-white shadow-2xl transition-all duration-300"
              style={{ width: viewport === "mobile" ? "390px" : "100%", maxWidth: viewport === "mobile" ? "390px" : "1440px" }}
            >
              <iframe
                key={`${page}-${frameKey}`}
                ref={frameRef}
                title={`Live preview of ${page}`}
                src={`${page}?hfm_visual_editor=1`}
                className="h-full w-full border-0 bg-white"
                onLoad={wireFrame}
              />
            </div>
          </div>

          <aside ref={inspectorRef} className="border-t border-white/10 bg-[#0b1713] p-5 xl:border-l xl:border-t-0">
            {!selection ? (
              <div className="sticky top-4">
                <div className="grid size-11 place-items-center rounded-2xl bg-[#d3a34d]/12 text-[#d3a34d]"><MousePointer2 className="size-5" /></div>
                <h2 className="mt-4 font-display text-2xl text-[#fff8ed]">Choose what you want to change.</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/52">Click an element directly, or press and hold it to reveal an Edit button. Right-click works too.</p>
                <div className="mt-5 space-y-2 text-xs text-white/45">
                  <p className="flex items-center gap-2"><Type className="size-3.5" /> Text, headings, labels, buttons</p>
                  <p className="flex items-center gap-2"><ImageIcon className="size-3.5" /> Images and alt text</p>
                  <p className="flex items-center gap-2"><Link2 className="size-3.5" /> Link destinations</p>
                </div>
              </div>
            ) : (
              <div className="sticky top-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d3a34d]">Selected element</p>
                <h2 className="mt-2 break-words font-display text-2xl text-[#fff8ed]">{selection.label}</h2>
                <p className="mt-2 break-all font-mono text-[10px] leading-relaxed text-white/28">{selection.selector}</p>

                {selection.tag === "a" ? (
                  <div className="mt-5 flex gap-2">
                    <button type="button" className={cn("rounded-full px-3 py-1.5 text-xs", selection.kind === "text" ? "bg-[#fff8ed] text-[#10281f]" : "bg-white/7 text-white/60")} onClick={() => switchLinkMode("text")}>
                      Edit label
                    </button>
                    <button type="button" className={cn("rounded-full px-3 py-1.5 text-xs", selection.kind === "link" ? "bg-[#fff8ed] text-[#10281f]" : "bg-white/7 text-white/60")} onClick={() => switchLinkMode("link")}>
                      Edit link
                    </button>
                  </div>
                ) : null}

                <div className="mt-5">
                  <Label className="text-[#fff8ed]">{selection.kind === "image" ? "Image URL" : selection.kind === "link" ? "Destination" : "Text"}</Label>
                  {selection.kind === "text" && selection.value.length > 90 ? (
                    <Textarea className="mt-2 min-h-40 bg-white/7 text-[#fff8ed]" value={selection.value} onChange={(event) => preview({ ...selection, value: event.target.value })} />
                  ) : (
                    <Input className="mt-2 bg-white/7 text-[#fff8ed]" value={selection.value} onChange={(event) => preview({ ...selection, value: event.target.value })} />
                  )}
                </div>

                {selection.kind === "image" ? (
                  <div className="mt-4">
                    <Label className="text-[#fff8ed]">Alt text</Label>
                    <Textarea className="mt-2 min-h-24 bg-white/7 text-[#fff8ed]" value={selection.alt} onChange={(event) => preview({ ...selection, alt: event.target.value })} />
                    <p className="mt-2 text-xs leading-relaxed text-white/38">Describe the actual image for screen readers.</p>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button type="button" variant="gold" disabled={busy || !selection.value.trim()} onClick={() => void save()}>
                    <Save className="mr-2 size-4" /> {busy ? "Saving…" : "Save live"}
                  </Button>
                  <Button type="button" variant="outline" disabled={busy} className="border-white/20 bg-transparent text-[#fff8ed]" onClick={() => void reset()}>
                    Reset
                  </Button>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-white/38">Changes are stored as safe text, image, or link overrides—never executable HTML.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
