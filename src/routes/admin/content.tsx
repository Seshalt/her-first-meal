import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminCmsAdd, adminCmsList } from "@/lib/server/admin";
import { RECIPES, WORKOUTS } from "@/lib/content/catalog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export const Route = createFileRoute("/admin/content")({ component: Content });

function Content() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof adminCmsList>>>([]);
  const [kind, setKind] = useState("binding-video");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    void adminCmsList().then(setItems);
  }, []);
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="font-display text-4xl">Content</h1>
        <p className="mt-2 text-sm text-white/60">
          Upload belly binding videos, reference images, recipes, education, and notes. Catalog recipes and workouts ship with the house; additions live here.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void adminCmsAdd({ data: { kind, title, body, url } }).then(() => {
              toast.success("Saved.");
              setTitle("");
              setBody("");
              setUrl("");
              void adminCmsList().then(setItems);
            });
          }}
        >
          <Label className="text-[#efe6d6]">Kind</Label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="h-11 w-full rounded-xl bg-white/8 px-3 text-sm"
          >
            <option value="binding-video">Belly binding video</option>
            <option value="binding-image">Reference image</option>
            <option value="recipe">Recipe</option>
            <option value="education">Education</option>
            <option value="workout">Workout</option>
            <option value="pdf">PDF / guide</option>
          </select>
          <Label className="text-[#efe6d6]">Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-white/8 text-[#efe6d6]" />
          <Label className="text-[#efe6d6]">URL or embed</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
          <Label className="text-[#efe6d6]">Notes</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
          <Button type="submit">Add to library</Button>
        </form>
        <ul className="mt-6 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="rounded-xl bg-white/6 p-3">
              <span className="text-white/50">{i.kind}</span> · {i.title}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-display text-2xl">Shipped catalog</h2>
        <p className="mt-2 text-xs text-white/50">{RECIPES.length} recipes · {WORKOUTS.length} movement sessions</p>
        <ul className="mt-4 max-h-[480px] space-y-2 overflow-y-auto text-sm">
          {RECIPES.map((r) => (
            <li key={r.id} className="rounded-xl bg-white/5 px-3 py-2">
              {r.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
