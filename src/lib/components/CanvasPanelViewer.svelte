<script lang="ts">
  import "@digirati/canvas-panel-web-components";

  const { canvasData = null } = $props();

  const encodeContentState = (plainContentState: string): string => {
    const uriEncoded = encodeURIComponent(plainContentState);
    const base64 = btoa(uriEncoded);
    const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_");
    const base64urlNoPadding = base64url.replace(/=/g, "");
    return base64urlNoPadding;
  };

  const iiifContent = $derived(
    canvasData ? encodeContentState(JSON.stringify(canvasData)) : null
  );
</script>

<canvas-panel iiif-content={iiifContent}> </canvas-panel>

<style>
  canvas-panel {
    --atlas-background: transparent;
  }
</style>
