<script lang="ts">
  const {
    items = [],
    selectedId = undefined,
    onSelect = (_item: any) => {},
  } = $props<{
    items?: any[];
    selectedId?: string | undefined;
    onSelect?: (item: any) => void;
  }>();

  import { getImageUrl, getCanvasLabel } from "../utils";

  const selectedIndex = $derived(
    Math.max(
      0,
      items.findIndex((c: any) => c?.id === selectedId)
    )
  );

  const canvasPrev = $derived(selectedIndex > 0);
  const canvasNext = $derived(selectedIndex < items.length - 1);

  const prev = () => {
    if (!canvasPrev) return;
    const nextIdx = selectedIndex - 1;
    const nextItem = items[nextIdx];
    if (nextItem) onSelect(nextItem);
  };

  const next = () => {
    if (!canvasNext) return;
    const nextIdx = selectedIndex + 1;
    const nextItem = items[nextIdx];
    if (nextItem) onSelect(nextItem);
  };

  let scroller: HTMLDivElement;

  $effect(() => {
    if (!selectedId || !scroller) return;
    const el = scroller.querySelector<HTMLElement>(
      `[data-id="${CSS.escape(selectedId)}"]`
    );
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  });
</script>

<div class="border border-gray-300 p-3 mx-4 mt-2 mb-2">
  <div class="flex items-center gap-3">
    <button
      type="button"
      class="border px-3 py-2 disabled:opacity-50 shrink-0"
      onclick={prev}
      disabled={!canvasPrev}
      aria-label="Previous thumbnails"
    >
      &lt;
    </button>

    <div class="flex-1 min-w-0 overflow-x-auto" bind:this={scroller}>
      <div class="w-full">
        <div class="flex gap-3 w-max mx-auto pb-2">
          {#each items as canvas (canvas.id)}
            <button
              data-id={canvas.id}
              class="flex shrink-0 flex-col items-center bg-transparent border-0 p-0 cursor-pointer"
              onclick={() => onSelect(canvas)}
              type="button"
              aria-label="Select {getCanvasLabel(canvas)}"
            >
              <div
                class="w-[100px] h-[150px] bg-white border overflow-hidden"
                class:border-black={selectedId === canvas.id}
                class:border-gray-300={selectedId !== canvas.id}
              >
                <img
                  src={getImageUrl(canvas, "thumb")}
                  alt={getCanvasLabel(canvas)}
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                class="mt-2 text-xs text-gray-800 text-center max-w-[100px] truncate"
                class:font-semibold={selectedId === canvas.id}
              >
                {getCanvasLabel(canvas)}
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <button
      type="button"
      class="border px-3 py-2 disabled:opacity-50 shrink-0"
      onclick={next}
      disabled={!canvasNext}
      aria-label="Next thumbnails"
    >
      &gt;
    </button>
  </div>
</div>
