<script lang="ts">
  export let value: string = '';
  export let placeholder: string = '';
</script>

<input
  bind:value
  {placeholder}
  spellcheck="false"
  type="text"
  class="w-36 rounded border border-neutral-700 bg-neutral-800 px-2 text-sm outline-none focus:ring-1 focus:ring-sky-400 focus:ring-offset-1 focus:ring-offset-neutral-900"
/>
