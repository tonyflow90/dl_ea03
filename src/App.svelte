<script>
	import TFExample from "./components/TFExample.svelte";
	// ui
	import "smelte/src/tailwind.css";
	import {
		Tooltip,
		Slider,
		Card,
		Snackbar,
		Button,
		ProgressCircular,
	} from "smelte";

	// svelte
	import { onMount } from "svelte";
	import FFNN from "./components/FFNN.svelte";

	// import TfModel from "./components/TFModel.svelte";

	// libraries
	// import * as tf from "@tensorflow/tfjs";
	// import "@tesorflow/tfjs-vis/tfjs-vis.umd.min.js";

	// Props
	let showSnackbar = false;
	let snackbarTimeout = 2000;

	let model = undefined;
	let modelName = "Car Model";
	let batchSize = 32;
	let epochs = 50;
	let url = "https://storage.googleapis.com/tfjs-tutorials/carsData.json";

	let running;
	let opened;

	// Data

	// Texts & Labels
	let taskTitle = "Regression mit FFNN";
	let taskNumber = 3;

	// Texts & Labels
	let labelBatchSize = "batch size";
	let labelEpoch = "epoch";

	let snackbarColor = "success";
	let message = "";

	let onError = (e) => {
		showSnackbar = true;
		message = e.detail.message;
		snackbarColor = "error";
	};

	// functions
	let runModel = () => {
		model.run();
	};

	let showModel = async () => {
		model.show();
	};
</script>

<header>
	<h5>Einsendeaufgabe {taskNumber}</h5>
	<h3>{taskTitle}</h3>
</header>

<main>
	<div class="grid">
		<div class="card">
			<FFNN
				on:running={(e) => (running = e.detail)}
				on:opened={(e) => (opened = e.detail)}
			/>
		</div>
	</div>
</main>

<Snackbar
	bind:value={showSnackbar}
	noAction
	color={snackbarColor}
	timeout={snackbarTimeout}
>
	<div>{message}</div>
	<div slot="action">
		<Button on:click={() => (showSnackbar = false)}>Close</Button>
	</div>
</Snackbar>

<footer>
	<div>
		<h5>Ressourcen</h5>
		<a href="https://github.com/tonyflow90/dl_ea03">
			<p>Github Repository</p>
		</a>
		<a href="https://svelte.dev/">
			<p>Svelte</p>
		</a>
		<a href="https://smeltejs.com/">
			<p>Smeltejs</p>
		</a>
	</div>
</footer>

<style>
	:root {
		--header-height: 160px;
		--footer-height: 160px;
		min-height: 100vh;
		height: 100vh;
		/* background-color: var(--color-black); */
		/* color: var(--color-white-500); */
	}

	/* body {
		height: 100vh;
	} */

	header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		min-height: var(--header-height);
		background-color: var(--color-primary-500);
		color: var(--color-black);
		padding: 1rem;
	}

	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 1rem;
	}

	footer {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		/* position: fixed; */
		min-height: var(--footer-height);
		height: 100%;
		/* width: 100vw; */
		bottom: 0;
		background-color: var(--color-secondary-700);
		text-align: center;
		font-size: small;
		padding: 1rem;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
