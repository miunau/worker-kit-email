<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../../app.css';
</script>

<Header />

<main>
	<slot />
</main>

<footer>
	<p>&copy; {new Date().getFullYear()} Acme Company Co.<br>
	123 Main Street, Anytown, USA</p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
		border: 1px solid #ccc;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

</style>
