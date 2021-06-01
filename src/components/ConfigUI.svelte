<script>
    // svelte
    import { onMount } from "svelte";
    import { Slider, Button, ProgressCircular, Select } from "smelte";

    // Texts & Labels
    let labelSettings = "Settings";
    let labelNeurons = "Neurons";
    let labelActivationFunction = "activation";
    let labelOptimizer = "optimizer";
    let labelLearningRate = "learning rate";
    let labelBatchSize = "batch size";
    let labelEpoch = "epoch";
    let labelHiddenLayer = "hidden layer";
    let labelMinWeight = "min weight";
    let labelMaxWeight = "max weight";

    // Props

    export let name = "Model 1";
    export let disabled = false;
    export let batchSize = 100; // Neuronen min 32 max 512
    export let epochs = 200; // Trainings Epochen 50 iterations
    export let hiddenLayerCount = 10; // Anzahl der hidden Layer
    export let stepWeight = 0.01;
    export let minWeight = 0;
    export let maxWeight = 1;
    export let maxMaxWeight = 1;
    export let activationFunction = "none";
    export let selectedOptimizer = "sgd"; // Optimizer
    export let learningRate = 0.01; // Lernrate
    export let neuronCount = 100;

    const activationList = [
        "none",
        "elu",
        "hardSigmoid",
        "linear",
        "relu",
        "relu6",
        "selu",
        "sigmoid",
        "softmax",
        "softplus",
        "softsign",
        "tanh",
        "swish",
        "mish",
    ];

    const optimizerList = [
        "sgd",
        "momentum",
        "adagrad",
        "adadelta",
        "adam",
        "adamax",
        "rmsprop",
    ];

    // lifecycle functions
    onMount(async () => {});
</script>

<div>
    <div class="settings">
        <h6 class="pt-6 pb-4">{labelBatchSize}: {batchSize}</h6>
        <Slider
            min="32"
            step="10"
            max="512"
            bind:value={batchSize}
            {disabled}
        />

        <h6 class="pt-6 pb-4">{labelEpoch}: {epochs}</h6>
        <Slider min="10" step="10" max="1000" bind:value={epochs} {disabled} />

        <h6 class="pt-6 pb-4">{labelNeurons}: {neuronCount}</h6>
        <Slider
            min="1"
            step="1"
            max="1000"
            bind:value={neuronCount}
            {disabled}
        />

        <h6 class="pt-6 pb-4">{labelHiddenLayer}: {hiddenLayerCount}</h6>
        <Slider
            min="1"
            step="1"
            max="100"
            bind:value={hiddenLayerCount}
            {disabled}
        />

        <h6 class="pt-6 pb-4">{labelMinWeight}: {minWeight}</h6>
        <Slider
            min="0"
            step={stepWeight}
            max={maxWeight}
            bind:value={minWeight}
            {disabled}
        />

        <h6 class="pt-6 pb-4">{labelMaxWeight}: {maxWeight}</h6>
        <Slider
            min={minWeight}
            step={stepWeight}
            max={maxMaxWeight}
            bind:value={maxWeight}
            {disabled}
        />

        <Select
            label={labelActivationFunction}
            items={activationList}
            bind:value={activationFunction}
            on:change={(v) => {
                activationFunction = v.detail;
            }}
        />

        <Select
            label={labelOptimizer}
            items={optimizerList}
            bind:value={selectedOptimizer}
            on:change={(v) => {
                selectedOptimizer = v.detail;
            }}
        />

        <h6 class="pt-6 pb-4">{labelLearningRate}: {learningRate}</h6>
        <Slider
            min=".001"
            step=".001"
            max=".1"
            bind:value={learningRate}
            {disabled}
        />
    </div>
</div>

<style>
    .settings {
        width: 300px;
    }
</style>
