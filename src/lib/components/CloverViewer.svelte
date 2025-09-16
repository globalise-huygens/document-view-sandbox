<script lang="ts">
  // Accept the same prop signature as other viewers
  export let canvasData: any = null;
</script>

<div
  class="w-full h-full flex items-center justify-center text-gray-500 text-sm border border-gray-300"
>
  Clover viewer placeholder
  {#if canvasData?.id}
    <span class="ml-2">({canvasData.id})</span>
  {/if}
</div>
