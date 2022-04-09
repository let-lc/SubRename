<script lang="ts">
  import clsx from 'clsx';
  import type { HighlightFileEntry } from 'src/app';
  import type { FileEntry } from '@tauri-apps/api/fs';

  export let files: Array<FileEntry> = [];
  export let selection: FileEntry = null;
  export let highlightFile: HighlightFileEntry = null;

  // auto select the first file from the new list if the original selection doesn't exist anymore
  $: if (!files.includes(selection)) selection = files[0] || null;
</script>

<div class="flex-grow select-none overflow-hidden rounded-sm bg-neutral-800">
  {#if files.length}
    <select
      size={2}
      bind:value={selection}
      class="group h-full w-full appearance-none bg-neutral-800 text-sm outline-none"
    >
      {#each files as file}
        <option
          value={file}
          title={file.name}
          class={clsx(
            'truncate border-b border-neutral-900 bg-neutral-800 transition-all duration-500 [background-size:200%_200%] checked:bg-gradient-to-r checked:text-neutral-900 hover:bg-neutral-700  group-focus:checked:[-webkit-text-fill-color:#171717]',
            highlightFile?.name === file.name
              ? '[background-position:-200%_-200%] checked:from-green-300 checked:to-cyan-400'
              : '[background-position:0%_0%] checked:from-cyan-300 checked:to-sky-400'
          )}
        >
          {highlightFile?.name === file.name ? highlightFile.newName : file.name}
        </option>
      {/each}
    </select>
  {:else}
    <p class="w-full h-full text-sm flex items-center justify-center">无文件</p>
  {/if}
</div>
