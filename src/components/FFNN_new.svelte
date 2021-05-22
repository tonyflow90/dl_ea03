<script>
    // svelte
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import {
        Tooltip,
        Slider,
        Card,
        Snackbar,
        Button,
        ProgressCircular,
        TextField,
        Select,
        Checkbox,
    } from "smelte";

    // Texts & Labels
    let labelDatasets = "Datasets";
    let labelTraining = "Training";
    let labelPrediction = "Prediction";
    let labelActivationFunction = "activation";
    let labelOptimizer = "optimizer";
    let labelLearningRate = "learning rate";
    let labelBatchSize = "batch size";
    let labelEpoch = "epoch";
    let labelHiddenLayer = "hidden layer";
    let labelDataset = "dataset";
    let labelMinWeight = "min weight";
    let labelMaxWeight = "max weight";

    // Events
    let running = false;
    let itemSelected = false;
    let training = false;

    $: training, dispatch("training", training);
    $: running, dispatch("running", running);

    // Props training

    // Labels
    let labelTrainingResult = "result";
    let labelTrainingSettings = "settings";
    let labelTrainingDataset = "training dataset";
    let labelTrainingDatasetSize = "training dataset size";

    let trainingDatasetSize = 1000;
    let batchSize = 512; // Neuronen min 32 max 512
    let epochs = 200; // Trainings Epochen 50 iterations
    let hiddenLayerCount = 200; // Anzahl der hidden Layer
    let stepWeight = 0.001;
    let minWeight = 0;
    let maxWeight = 0.2;
    let activationFunction = "none";
    let selectedOptimizer = "sgd"; // Optimizer
    let learningRate = 0.001; // Lernrate

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

    // Charts
    let trainingDataChart, trainChart;

    // Data
    let trainingData;

    // Model
    let modelName = "FFNNModel";
    let trainedModel;

    // Props prediction

    // Data
    let dataset1, dataset2, dataset3, selectedDataset;
    let datasets = [];

    // Charts
    let datasetChart1, datasetChart2, datasetChart3, predictChart;

    // Documentation
    let labelDocumentation = "Documentation";
    let mdUrl = "./files/documentation.md";

    // lifecycle functions
    onMount(async () => {
        trainingData = getTrainingData(trainingDatasetSize);
        showData(trainingDataChart, trainingData);

        dataset1 = getRandomData(0.1, 0.3);
        showData(datasetChart1, dataset1);

        datasets = [
            { value: 0, text: "Training Dataset", data: trainingData },
            { value: 1, text: "Dataset 1", data: dataset1 },
        ];
    });

    // functions

    // Model
    let createModel = () => {
        // Create a sequential model
        let model = tf.sequential();

        let weights = [
            tf.randomUniform([1, hiddenLayerCount], 1, 1),
            tf.randomUniform([hiddenLayerCount], minWeight, maxWeight),
        ];

        // Add a single input layer
        let inputConfig = {
            name: "hiddenlayer",
            inputShape: [1],
            units: hiddenLayerCount,
            weights: weights,
            useBias: true,
        };
        if (activationFunction != "none")
            inputConfig.activation = activationFunction;

        let layer = tf.layers.dense(inputConfig);
        model.add(layer);

        // Add an output layer
        let outputConfig = {
            units: 1,
            // useBias: true,
        };
        model.add(tf.layers.dense(outputConfig));

        return model;
    };

    let saveModel = async (model, name) => {
        return await model.save(`localstorage://${name}`);
    };

    let loadModel = async (name) => {
        return await tf.loadLayersModel(`localstorage://${name}`);
    };

    let getOptimizer = (name, learningRate) => {
        let optimizer;
        switch (name) {
            case "sgd":
                optimizer = tf.train.sgd(learningRate);
                break;
            case "momentum":
                optimizer = tf.train.momentum(learningRate);
                break;
            case "adagrad":
                optimizer = tf.train.adagrad(learningRate);
                break;
            case "adadelta":
                optimizer = tf.train.adadelta(learningRate);
                break;
            case "adam":
                optimizer = tf.train.adam(learningRate);
                break;
            case "adamax":
                optimizer = tf.train.adamax(learningRate);
                break;
            case "rmsprop":
                optimizer = tf.train.rmsprop(learningRate);
                break;
            default:
                optimizer = tf.train.adam(learningRate);
                break;
        }

        return optimizer;
    };

    // Data
    let getTrainingData = (nCount = 100) => {
        let dataArray = [];
        for (let i = 0; i < 1; i+=1/nCount) dataArray.push({ x: i, y: calcY(i) });
        // for (let i = 8; i < 10; i += 0.01)
        //     dataArray.push({ x: i, y: calcY(i) });
        return dataArray;
    };

    let calcY = (x) => {
        const y = (x + 0.8) * (x - 0.2) * (x - 0.3) * (x - 0.6);
        return y;
    };

    let calcYs = (x) => {
        // const ys = (x + 0.8) * (x - 0.2) * (x - 0.3) * (x - 0.6);
        let xs = tf.tensor1d([x]);
        let x1 = xs.add(0.8),
            x2 = xs.sub(0.2),
            x3 = xs.sub(0.3),
            x4 = xs.sub(0.6);
        const ys = x1.mul(x2.mul(x3).mul(x4));
        return ys.dataSync();
    };

    let getRandomData = (nMin, nMax) => {
        let dataArray = [];
        for (let i = 0; i < 1; i+=1/10) {
            let x = i;
            let y = calcY(x); // + Math.random() * (nMax - nMin) + nMin;
            dataArray.push({ x: x, y: y });
        }
        return dataArray;
    };

    let prepareTrainingData = (data) => {
        return tf.tidy(() => {
            // Step 1. Shuffle the data
            tf.util.shuffle(data);

            // Step 2. Convert data to Tensor
            const inputs = data.map((d) => d.x);
            const labels = data.map((d) => d.y);
            const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
            const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

            //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
            const inputMax = inputTensor.max();
            const inputMin = inputTensor.min();
            const labelMax = labelTensor.max();
            const labelMin = labelTensor.min();

            const normalizedInputs = inputTensor
                .sub(inputMin)
                .div(inputMax.sub(inputMin));
            const normalizedLabels = labelTensor
                .sub(labelMin)
                .div(labelMax.sub(labelMin));

            return {
                inputs: normalizedInputs,
                labels: normalizedLabels,
                // Return the min/max bounds so we can use them later.
                inputMax,
                inputMin,
                labelMax,
                labelMin,
            };
        });
    };

    let showData = (htmlElement, values) => {
        tfvis.render.scatterplot(
            htmlElement,
            { values: values },
            {
                xLabel: "X",
                yLabel: "Y",
                height: 200,
                width: 400,
            }
        );
    };

    let trainModel = async (model, inputs, labels) => {
        const optimizer = getOptimizer(selectedOptimizer, learningRate);

        debugger;
        // Prepare the model for training.
        model.compile({
            optimizer: optimizer,
            loss: tf.losses.meanSquaredError,
            metrics: ["mse"],
        });

        return await model.fit(inputs, labels, {
            batchSize,
            epochs,
            shuffle: true,
            // validationSplit: 0.2,
            // validationData: labels,
            callbacks: tfvis.show.fitCallbacks(
                trainChart,
                ["val_loss", "loss", "val_mse", "mse"],
                {
                    height: 200,
                    width: 400,
                    callbacks: ["onEpochEnd"],
                }
            ),
        });
    };

    let testModel = (model, inputData, normalizationData) => {
        const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

        const [x, y] = tf.tidy(() => {
            const xInputs = inputData.map((d) => d.x);
            const xs = tf.tensor2d(xInputs, [xInputs.length, 1]);
            const normalizedX = xs.sub(inputMin).div(inputMax.sub(inputMin));
            const ys = model.predict(normalizedX);
            debugger;

            const unNormXs = normalizedX.mul(inputMax.sub(inputMin)).add(inputMin);
            const unNormPreds = ys.mul(labelMax.sub(labelMin)).add(labelMin);

            return [unNormXs.dataSync(), unNormPreds.dataSync()];
        });

        const predictedPoints = Array.from(x).map((val, i) => {
            return { x: val, y: y[i] };
        });

        const originalPoints = inputData.map((d) => ({
            x: d.x,
            y: calcY(d.x),
        }));

        console.log(predictedPoints);
        console.log(originalPoints);

        tfvis.render.scatterplot(
            predictChart,
            {
                values: [originalPoints, predictedPoints],
                series: ["original", "predicted"],
            },
            {
                xLabel: "X",
                yLabel: "Y",
                height: 400,
                width: 600,
            }
        );
    };

    export async function run() {
        training = true;
        running = true;

        // Create the model
        let model = createModel();

        // Convert the data to a form we can use for training.
        const tensorData = prepareTrainingData(trainingData);
        const { inputs, labels } = tensorData;

        // Train the model
        await trainModel(model, inputs, labels);
        training = false;
        // trainedModel = model;

        // // Create the model
        // let model = trainedModel ? trainedModel : await loadModel(modelName);
        model.summary();

        // Get Data
        let data = datasets[1].data; //selectedDataset.data;

        // Make some predictions using the model and compare them to the
        // original data
        testModel(model, data, prepareTrainingData(data));
        // testModel(model, data, tensorData);
        running = false;
    }
</script>

<h3>{labelTraining}</h3>
<!-- <div class="grid">
    <div>
        <h5 class="pb-4">{labelTrainingDataset}</h5>
        <h6 class="pt-6 pb-4">
            {labelTrainingDatasetSize}: {trainingDatasetSize}
        </h6>
        <Slider
            min="100"
            step="100"
            max="10000"
            bind:value={trainingDatasetSize}
            on:change={() => {
                trainingData = getTrainingData(trainingDatasetSize);
                datasets[0].data = trainingData;
                showData(trainingDataChart, trainingData);
            }}
            disabled={running || training}
        />
        <div id="trainingDataChart" bind:this={trainingDataChart} />
    </div>

    <div>
        <h5 class="pb-4">{labelTrainingSettings}</h5>
        <div class="settings">
            <h6 class="pt-6 pb-4">{labelBatchSize}: {batchSize}</h6>
            <Slider
                min="32"
                step="10"
                max="512"
                bind:value={batchSize}
                disabled={running || training}
            />

            <h6 class="pt-6 pb-4">{labelEpoch}: {epochs}</h6>
            <Slider
                min="10"
                step="10"
                max="1000"
                bind:value={epochs}
                disabled={running || training}
            />

            <h6 class="pt-6 pb-4">{labelHiddenLayer}: {hiddenLayerCount}</h6>
            <Slider
                min="1"
                step="1"
                max="100"
                bind:value={hiddenLayerCount}
                disabled={running || training}
            />

            <h6 class="pt-6 pb-4">{labelMinWeight}: {minWeight}</h6>
            <Slider
                min="0"
                step={stepWeight}
                max={maxWeight}
                bind:value={minWeight}
                disabled={running || training}
            />

            <h6 class="pt-6 pb-4">{labelMaxWeight}: {maxWeight}</h6>
            <Slider
                min={minWeight}
                step={stepWeight}
                max=".1"
                bind:value={maxWeight}
                disabled={running || training}
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
                disabled={running || training}
            />

            {#if training}
                <ProgressCircular />
            {:else}
                <Button
                    block
                    outlined
                    on:click={train}
                    disabled={running || training}
                >
                    train
                </Button>
            {/if}
        </div>
    </div>

    <div>
        <h5 class="pb-4">{labelTrainingResult}</h5>
        <div id="train_chart" bind:this={trainChart} />
    </div>
</div> -->

<div id="trainingDataChart" bind:this={trainingDataChart} />

<div id="train_chart" bind:this={trainChart} />

<br />

<h3>{labelDatasets}</h3>
<div class="grid">
    <div id="datasetChart1" bind:this={datasetChart1} />
    <div id="datasetChart2" bind:this={datasetChart2} />
    <div id="datasetChart3" bind:this={datasetChart3} />
</div>

<h3>{labelPrediction}</h3>
<div class="grid prediction-grid">
    <div>
        <div class="settings">
            <Select
                label={labelDataset}
                items={datasets}
                on:change={(v) => {
                    itemSelected = true;
                    selectedDataset = datasets[v.detail];
                }}
            />

            {#if running}
                <ProgressCircular />
            {:else}
                <Button
                    block
                    outlined
                    on:click={run}
                    disabled={running || training || !itemSelected}
                >
                    predict
                </Button>
            {/if}
        </div>

        <div id="predict_chart" bind:this={predictChart} />
    </div>
</div>

<h3>{labelDocumentation}</h3>
<div class="grid">
    <zero-md src={mdUrl} />
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        column-gap: 20px;
        row-gap: 20px;
        justify-items: center;
    }

    .prediction-grid {
        min-height: 300px;
    }

    .settings {
        width: 300px;
    }
</style>
