<script>
	// ui
	import "smelte/src/tailwind.css";
	import {
		Tooltip,
		Slider,
		Card,
		TextField,
		Select,
		Snackbar,
		Button,
		ProgressCircular,
	} from "smelte";

	// svelte
	import { onMount } from "svelte";
	import TFModel from "./components/TFModel.svelte";
	import ConfigUI from "./components/ConfigUI.svelte";

	// Texts & Labels
	let taskTitle = "Regression mit FFNN";
	let taskNumber = 3;

	let labelTrainingDataset = "Training Datasets";
	let labelDataset = "Prediction Datasets";
	let labelInput = "Prediction input";

	let labelSettings = "Settings";
	let labelTraining = "Training";
	let labelPrediction = "Prediction";
	let labelPredictionDataset = "Dataset";
	let labelPredictionSingleInput = "Single Input";
	let labelPredictionResult = "Result";

	// Charts
	let trainChart, trainingDataChart, predictionDataChart;

	// Props
	let model;
	let modelName = "FFNN Model";
	let modelIsWorking = false;
	let trained = false;

	let showSnackbar = false;
	let snackbarTimeout = 2000;
	let snackbarColor = "success";
	let message = "";

	// Data
	let trainingData100_1, trainingData100_2, trainingData100_3;
	let trainingData100, trainingData1000, trainingData10000;
	let dataset1, dataset2, dataset3;
	let inputSinglePredict = "";
	let selectedTrainingDataset,
		selectedDataset = undefined;
	let trainingDatasets,
		datasets = [];

	// initial Config
	let batchSize = 32; // Neuronen min 32 max 512
	let epochs = 10; // Trainings Epochen 50 iterations
	let hiddenLayerCount = 1; // Anzahl der hidden Layer
	let activationFunction = "none";
	let selectedOptimizer = "sgd"; // Optimizer
	let learningRate = 0.001; // Lernrate
	let neuronCount = 1;
	let maxWeight = 1;
	let minWeight = 0;

	// Documentation
	let labelDocumentation = "Documentation";
	let mdUrl = "./files/documentation.md";

	// lifecycle functions
	onMount(async () => {
		trainingData100_1 = await loadTrainingData(
			"./data/TrainingData_Size_100_Range_-1.8_1.8.json"
		);
		trainingData100_2 = await loadTrainingData(
			"./data/TrainingData_Size_100_Range_-100_100.json"
		);
		trainingData100_3 = await loadTrainingData(
			"./data/TrainingData_Size_100_Range_0_1.8.json"
		);

		trainingData1000 = await loadTrainingData(
			"./data/TrainingData_Size_1000_Range_-1.8_1.8.json"
		);
		trainingData10000 = await loadTrainingData(
			"./data/TrainingData_Size_10000_Range_-1.8_1.8.json"
		);

		let test = await loadTrainingData("./data/test.json");

		let test2 = generateRandomData(1000, -100, 100);

		trainingDatasets = [
			{
				value: 0,
				text: "Dataset 1 Size: 100 Range: -100 to 100",
				data: trainingData100_1,
			},
			{
				value: 1,
				text: "Dataset 2 Size: 100 Range: -1.8 to 1.8",
				data: trainingData100_2,
			},
			{
				value: 2,
				text: "Dataset 3 Size: 100 Range: 0 to 1.8",
				data: trainingData100_3,
			},
			{
				value: 3,
				text: "Dataset 4 Size: 1000 Range: -1.8 to 1.8",
				data: trainingData1000,
			},
			{
				value: 4,
				text: "Dataset 5 Size: 10000 Range: -1.8 to 1.8",
				data: trainingData10000,
			},
		];

		dataset1 = generateRandomData(10, -100, 100);
		dataset2 = generateRandomData(10, -1.8, 1.8);
		dataset3 = generateRandomData(10, 0, 1.8);

		datasets = [
			{
				value: 0,
				text: "Dataset Size: 100 Range: -100 to 100",
				data: dataset1,
			},
			{
				value: 1,
				text: "Dataset Size: 100 Range: -1.8 to 1.8",
				data: dataset2,
			},
			{
				value: 2,
				text: "Dataset Size: 100 Range: 0 to 1.8",
				data: dataset3,
			},
		];
	});

	let onError = (e) => {
		showSnackbar = true;
		message = e.detail.message;
		snackbarColor = "error";
	};

	async function loadTrainingData(url) {
		const dataResponse = await fetch(url);
		const data = await dataResponse.json();
		return data;
	}

	let calcY = (x) => {
		let y = (x + 0.8) * (x - 0.2) * (x - 0.3) * (x - 0.6);
		// let y = (x * x) + 0.6;
		// const y = (x + 0.8) * (x - 0.2) * (x - 0.3) * (x - 0.6);
		return y;
	};

	let generateRandomData = (nCount = 10, nMin = -1.8, nMax = 1.8) => {
		let dataArray = [];
		for (let i = 0; i < nCount; i++) {
			let x = Math.random() * (nMax - nMin) + nMin;
			dataArray.push({ x: x, y: calcY(x) });
		}
		return dataArray;
	};

	// functions
	let train = async () => {
		await model.train(selectedTrainingDataset.data);
		trained = true;
	};

	let predict = async () => {
		let predictedData = await model.predict(
			selectedDataset.data,
			selectedTrainingDataset.data
		);

		createChart(
			predictionDataChart,
			[selectedDataset.data, predictedData],
			["original", "predicted"]
		);
	};

	let predictSingleInput = async () => {
		let x = parseFloat(inputSinglePredict);
		let data = [{ x: x, y: calcY(x) }];
		let predictedData = await model.predict(
			data,
			selectedTrainingDataset.data
		);

		createChart(
			predictionDataChart,
			[data, predictedData],
			["original", "predicted"]
		);
	};

	let createChart = (htmlElement, values, series) => {
		tfvis.render.scatterplot(
			htmlElement,
			{ values: values, series: series },
			{
				xLabel: "X",
				yLabel: "Y",
				height: 200,
				width: 400,
			}
		);
	};
</script>

<header>
	<h5>Einsendeaufgabe {taskNumber}</h5>
	<h3>{taskTitle}</h3>
</header>

<main>
	<div class="grid">
		<TFModel
			{modelName}
			showTraining="true"
			chart={trainChart}
			{batchSize}
			{epochs}
			{minWeight}
			{maxWeight}
			{hiddenLayerCount}
			{activationFunction}
			{selectedOptimizer}
			{learningRate}
			{neuronCount}
			bind:this={model}
			on:predicting={(e) => (modelIsWorking = e.detail)}
			on:training={(e) => (modelIsWorking = e.detail)}
		/>

		<div>
			<h5 class="pb-4">{labelSettings}</h5>
			<ConfigUI
				disabled={modelIsWorking}
				bind:name={modelName}
				bind:batchSize
				bind:epochs
				bind:minWeight
				bind:maxWeight
				bind:hiddenLayerCount
				bind:activationFunction
				bind:selectedOptimizer
				bind:learningRate
				bind:neuronCount
			/>
		</div>

		<div>
			<h5 class="pb-4">{labelTraining}</h5>
			{#if modelIsWorking}
				<ProgressCircular />
			{/if}
			<Select
				label={labelTrainingDataset}
				items={trainingDatasets}
				disabled={modelIsWorking}
				on:change={(v) => {
					selectedTrainingDataset = trainingDatasets[v.detail];
				}}
			/>
			<Button
				block
				outlined
				on:click={train}
				disabled={!selectedTrainingDataset || modelIsWorking}
				>train</Button
			>

			<div id="train_chart" bind:this={trainChart} />
		</div>

		<div>
			<h5 class="pb-4">{labelPrediction}</h5>
			{#if modelIsWorking}
				<ProgressCircular />
			{/if}
			<h5 class="pt-6 pb-4">{labelPredictionDataset}</h5>
			<Select
				label={labelDataset}
				items={datasets}
				disabled={!trained || modelIsWorking}
				on:change={(v) => {
					selectedDataset = datasets[v.detail];
				}}
			/>
			<Button
				block
				outlined
				on:click={predict}
				disabled={!trained || !selectedDataset || modelIsWorking}
				>predict</Button
			>
			<br />

			<h5 class="pt-6 pb-4">{labelPredictionSingleInput}</h5>
			<TextField
				label={labelInput}
				type="number"
				bind:value={inputSinglePredict}
				disabled={!trained || modelIsWorking}
				outlined
			/>
			<Button
				block
				outlined
				on:click={predictSingleInput}
				disabled={!trained ||
					inputSinglePredict == "" ||
					modelIsWorking}>predict</Button
			>
			<br />

			<h5 class="pt-6 pb-4">{labelPredictionResult}</h5>
			<div id="trainingDataChart" bind:this={trainingDataChart} />
			<div id="predictionDataChart" bind:this={predictionDataChart} />
		</div>
	</div>
	<h3>{labelDocumentation}</h3>
	<div class="grid">
		<zero-md src={mdUrl} />
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
	}

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

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		column-gap: 20px;
		row-gap: 20px;
		justify-items: center;
	}

	.grid * {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
