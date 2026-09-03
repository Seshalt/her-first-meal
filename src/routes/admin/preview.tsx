import { createFileRoute } from "@tanstack/react-router";
import { setWalkMode } from "@/lib/preview-mode";

export const Route = createFileRoute("/admin/preview")({ component: PreviewWalk });

function PreviewWalk() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/50">Member trail</p>
      <h1 className="mt-2 font-display text-4xl">Walk the house as a member.</h1>
      <p className="mt-4 max-w-xl text-sm text-white/70">
        Open the public pages as a guest would: landing, membership, checkout, the receipt, then the member rooms.
        Nothing is charged. Toggle back to the atelier when you are done.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full bg-[#efe6d6] px-5 py-3 text-sm text-[#101918]"
          onClick={() => {
            setWalkMode("member");
            window.location.assign("/pricing?preview=1");
          }}
        >
          Start mock purchase
        </button>
        <button
          type="button"
          className="rounded-full border border-white/20 px-5 py-3 text-sm"
          onClick={() => {
            setWalkMode("member");
            window.location.assign("/");
          }}
        >
          See the landing as a guest
        </button>
        <button
          type="button"
          className="rounded-full border border-white/20 px-5 py-3 text-sm"
          onClick={() => {
            setWalkMode("admin");
            window.location.assign("/admin");
          }}
        >
          Back to atelier
        </button>
      </div>
    </div>
  );
}
