<script lang="ts">
  import { RoundFolderOpen } from './icons';

  export let path: string;
  export let openFn: VoidFunction;
</script>

<div class="flex items-center overflow-hidden rounded bg-neutral-800 text-sm">
  <RoundFolderOpen class="mx-1 h-5 w-5" />
  <input
    type="text"
    readonly
    bind:value={path}
    class="flex-grow cursor-text bg-transparent outline-none selection:bg-sky-300 selection:text-neutral-900"
  />
  <button
    on:click={openFn}
    class="flex select-none items-center gap-x-1.5 bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 px-4 py-1 text-neutral-900 transition-all duration-300 [background-size:200%_200%] [background-position:0%_0%] hover:[background-position:100%_100%]"
  >
    打开
  </button>
</div>
