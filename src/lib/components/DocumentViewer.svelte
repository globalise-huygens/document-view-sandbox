<script>
  import Viewer from "./OSDViewer.svelte";
  export let metadata = {
    inventoryNumber: "3598",
    year: "1781",
    description:
      "Twee afschriften van in 1781 door gouverneur Barend Reijke en raad tot Makasser aan de hoge regering tot Batavia verzonden brieven.",
  };

  export let transcript = [
    "Notitie van Alle soo van, als na Batavia",
    "„en afgaande",
    "alhier ten Handel Komende, Vaertuij,,",
    "„gen, te Weeten ’t Ledert Primo October",
    "Anno Passato tot ultema deeses Namentligk",
    "Aankomende Vaartuijen",
    "den 3 october van Batavia den burger alhier Axel Anthonij Rosenquest",
    "per Paduwackang genaamt de Jonge Dirk",
    "groot 20 lasten bemant met 30 koppen, was ge,,",
    "„monthoered met 7 p,s metele stukjes, 12 snap,,",
    "„hanen 4 donderbussen , rassegaaijen, 2 p.s pistoo,,",
    "„len, 80 p,s Loode koegels en 40 lb bus kruijt, als",
    "passagiers den meede burger sebastiaan",
    "Knitel en den Jnlandsche vrouw Clara met",
    "haar zoontje, brengt aan 10 vatjes boter 70 va,,",
    "„tens bier 12 kassen wijn en bier en 5 kelders",
    "genever",
    "„,,o, den Chinees Tiohajisoe per dito van den oud Adsis,,",
    "„tent Hendrik Bewers, groot 8 lasten, bemant",
    "met 24 koppen, , was gemonthoerd met 6 p,s rantac,,",
    "„kangs, 12 p,s ,,snaphaen, 6; p,s donderbussen, 25 p,s rond,,",
    "„scherp, en 60 lb bus kruijt, als passagiers den meede",
    "Chinees Theoenkon, en den boeijenees Batjo en",
    "Basso brengt aan 1 kist amphioen 11 pijpen araa,,",
    "en 10 Kassen aracq, 20 p,s Randij suijker, 6 pr Ci:o oud",
  ];

  export let scanCount = 12;
</script>

<div class="grid gap-4 p-4 md:grid-cols-2">
  <div class="md:col-span-2 text-sm p-4 border border-gray-300">
    <h2>Historisch document</h2>
    <p><strong>Inventarisnummer</strong> {metadata.inventoryNumber}</p>
    <p><strong>Jaar</strong> {metadata.year}</p>
    <p><strong>Beschrijving</strong> {metadata.description}</p>
  </div>
  <div>
    <Viewer />
  </div>
  <div class="m-0 font-mono leading-6 p-4 border border-gray-300">
    {#each transcript as line, index}
      <div>{index + 1}. {line}</div>
    {/each}
  </div>
</div>

<div class="flex justify-between px-4 mt-[-0.5rem] font-bold">
  <div>&lt;</div>
  <div>{scanCount} scans</div>
  <div>&gt;</div>
</div>

<div
  class="grid"
  style="grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 0.5rem; margin-top: 2rem; padding: 1rem;"
>
  {#each Array(scanCount)
    .fill(0)
    .map((_, i) => i + 1) as page}
    <div
      class="w-full h-20 border border-gray-300 flex justify-center items-center text-xs text-gray-800"
    >
      Page {page}
    </div>
  {/each}
</div>
