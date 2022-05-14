<script lang="ts">
  // Wrap values that you want to substitute with data from your POST request in triple curly braces.
  export let name: string = '{{{name}}}'; // will be replaced "John" using { "data": { "name": "John" } } when sending
</script>

<h1>Hello {name}!</h1>
<p>This is a test transactional email from CloudFlare Workers via SvelteKit.</p>

<h2>It's cool!</h2>
<p>Send all the content as HTML using Svelte templates! Develop with your browser using regular SvelteKit routes.</p>

<style>
  h2 {
    font-weight: normal;
  }
</style>