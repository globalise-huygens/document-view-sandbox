<script lang="ts">
  export let metadata = {
    inventoryNumber: "3598",
    year: "1781",
    description:
      "Twee afschriften van in 1781 door gouverneur Barend Reijke en raad tot Makasser aan de hoge regering tot Batavia verzonden brieven.",
  };
</script>

<div>
  <h2 class="text-lg font-bold mb-2">Metadata</h2>
  <p><strong>Inventarisnummer:</strong> {metadata.inventoryNumber}</p>
  <p><strong>Jaar:</strong> {metadata.year}</p>
  <p><strong>Beschrijving:</strong> {metadata.description}</p>
</div>
