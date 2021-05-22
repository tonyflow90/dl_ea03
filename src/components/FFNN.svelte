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
    let labelNeurons = "Neurons";
    let labelFFNN = "Training & Prediction";
    let labelSettinngs = "Settings";
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
    let batchSize = 32; // Neuronen min 32 max 512
    let epochs = 50; // Trainings Epochen 50 iterations
    let hiddenLayerCount = 25; // Anzahl der hidden Layer
    let stepWeight = 0.01;
    let minWeight = 0;
    let maxWeight = 1;
    let activationFunction = "none";
    let selectedOptimizer = "sgd"; // Optimizer
    let learningRate = 0.001; // Lernrate
    let neuronCount = 5;

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
        trainingData = getTrainingData(trainingDatasetSize, -1.8, 1.8);
        showData(trainingDataChart, trainingData);

        dataset1 = getRandomData(1, 10);
        dataset2 = getRandomData(25, 50);
        dataset3 = getRandomData(80, 120);
        showData(datasetChart1, dataset1);
        showData(datasetChart2, dataset2);
        showData(datasetChart3, dataset3);

        datasets = [
            { value: 0, text: "Training Dataset", data: trainingData },
            { value: 1, text: "Dataset 1", data: dataset1 },
            { value: 2, text: "Dataset 2", data: dataset2 },
            { value: 3, text: "Dataset 3", data: dataset3 },
        ];
    });

    // functions

    // Model
    let createModel = () => {
        // Create a sequential model
        let model = tf.sequential();

        let weights = [
            tf.randomUniform([1, neuronCount], 0, 1),
            tf.randomUniform([neuronCount], 0, 1),
        ];

        // Add a input layer
        let inputConfig = {
            name: "inputlayer",
            inputShape: [1],
            units: neuronCount,
            weights: weights,
            useBias: true,
        };
        if (activationFunction != "none")
            inputConfig.activation = activationFunction;

        let layer = tf.layers.dense(inputConfig);
        model.add(layer);

        // Add a hidden layer
        let hiddenConfig = {
            name: "hiddenlayer",
            units: neuronCount,
            // weights: weights,
            useBias: true,
        };
        if (activationFunction != "none")
            inputConfig.activation = activationFunction;

        let hiddenLayer = tf.layers.dense(hiddenConfig);
        for (let i = 0; i < hiddenLayerCount; i++) {
            model.add(hiddenLayer);
        }

        // Add an output layer
        let outputConfig = {
            units: 1,
            useBias: true,
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
    let getTrainingData = (nCount = 100, nMin = -1, nMax = 1) => {
        let dataArray = [];
        for (let i = 0; i < nCount; i++) {
            let x = Math.random() * (nMax - nMin) + nMin;
            dataArray.push({ x: x, y: calcY(x) });
        }
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
        for (let i = nMin; i < nMax; i++) {
            let x = i;
            let y = calcY(x);
            dataArray.push({ x: x, y: y });
        }
        return dataArray;
    };

    let prepareData = (data) => {
        return tf.tidy(() => {
            // Step 1. Shuffle the data
            tf.util.shuffle(data);

            // Step 2. Convert data to Tensor
            const inputs = data.map((d) => d.x);
            const labels = data.map((d) => calcY(d.x));
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

    // Train
    export async function train() {
        training = true;

        // Create the model
        let model = createModel();

        // Convert the data to a form we can use for training.
        const tensorData = prepareData(trainingData);
        const { inputs, labels } = tensorData;

        // Train the model
        await trainModel(model, inputs, labels);
        saveModel(model, modelName);
        trainedModel = model;
        training = false;
    }

    let trainModel = async (model, inputs, labels) => {
        const optimizer = getOptimizer(selectedOptimizer, learningRate);

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
            callbacks: tfvis.show.fitCallbacks(
                trainChart,
                ["val_loss", "loss", "val_mse", "mse"],
                {
                    yAxisDomain: [0,.1],
                    height: 200,
                    width: 400,
                    callbacks: ["onEpochEnd"],
                }
            ),
        });
    };

    // Predict
    export async function predict() {
        running = true;

        // Create the model
        let model = trainedModel ? trainedModel : await loadModel(modelName);
        model.summary();

        // Get Data
        let data = selectedDataset.data;

        // Convert the data to a form we can use for training.
        const tensorData = prepareData(data);
        const { inputs } = tensorData;

        // Make some predictions using the model and compare them to the
        // original data
        testModel(model, data, tensorData);
        running = false;
    }

    let testModel = (model, inputData, normalizationData) => {
        const { inputs, inputMax, inputMin, labelMin, labelMax } =
            normalizationData;

        const [x, y] = tf.tidy(() => {
            const xInputs = inputData.map((d) => d.x);
            const x = tf.tensor2d(xInputs, [xInputs.length, 1]);
            const yun = model.predict(x);
            const y = model.predict(inputs);

            // const x = inputData;
            // const y = model.predict(x.reshape([x.size, 1]));

            const unNormXs = inputs.mul(inputMax.sub(inputMin)).add(inputMin);
            const unNormPreds = y.mul(labelMax.sub(labelMin)).add(labelMin);

            // console.log(x.dataSync())
            // console.log(inputs.dataSync())
            // console.log(unNormXs.dataSync())

            console.log(inputData.map((d) => d.y));
            console.log(yun.dataSync());
            console.log(y.dataSync());
            console.log(unNormPreds.dataSync());

            // Un-normalize the data
            return [unNormXs.dataSync(), unNormPreds.dataSync()];
        });

        // const xInputs = inputData.map((d) => d.x);
        // const xTensor = tf.tensor2d(xInputs, [xInputs.length, 1]);
        // const yTensor = model.predict(xTensor);

        // const x = xTensor.dataSync();
        // const y = yTensor.dataSync();

        // console.log(x);
        // console.log(y);

        const predictedPoints = Array.from(x).map((val, i) => {
            return { x: val, y: y[i] };
        });

        const originalPoints = inputData.map((d) => ({
            x: d.x,
            y: d.y,
        }));

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
</script>

<h3>{labelTraining}</h3>
<div class="grid">
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

            <h6 class="pt-6 pb-4">{labelNeurons}: {neuronCount}</h6>
            <Slider
                min="1"
                step="1"
                max="1000"
                bind:value={neuronCount}
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
                max="1"
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
</div>

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
                    on:click={predict}
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
