<script context="module" lang="ts">
	export const prerender = true;
</script>

<svelte:head>
	<title>Templated emails with SvelteKit on CloudFlare Workers</title>
</svelte:head>

<section>
	<h1>This is a test page for templated emails using SvelteKit on CloudFlare Workers.</h1>

	<p>With CloudFlare's new <a href="https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels/">MailChannel</a> integration, you can send emails from workers.</p>

	<h2>Try it out!</h2>
	<p>Enter your email address:</p>
	<input type="email" placeholder="Your email">
	<button>Send</button>
</section>

<style>
	h1 {
		width: 100%;
	}
</style>
