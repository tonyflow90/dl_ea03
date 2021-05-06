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
    let labelUserdataset = "dataset";
    let labelMinWeight = "min weight";
    let labelMaxWeight = "max weight";

    // events
    let running = false;
    let itemSelected = false;
    let training = false;

    $: training, dispatch("training", training);
    $: running, dispatch("running", running);

    // Charts
    let trainingDataChart,
        userDataChart1,
        userDataChart2,
        userDataChart3,
        userDataChart4,
        trainChart,
        predictChart;

    // Props
    let model;
    let data, inputData, inputDataArray;

    $: inputData, (inputDataArray = inputData ? inputData.split(" ") : "");

    let batchSize = 32; // Neuronen min 32 max 512
    let epochs = 50; // Trainings Epochen 50 iterations
    let hiddenLayerCount = 1; // Anzahl der hidden Layer
    let minWeight = 0;
    let maxWeight = 1;
    let activationFunction = "none";
    let selectedOptimizer = "adam"; // Optimizer
    let learningRate = 0.001; // Lernrate

    let selectedUserDataset;
    let userDatasets = [];

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

    const selectUserDatasets = [
        { value: 0, text: "Training Dataset" },
        { value: 1, text: "Dataset 1" },
        { value: 2, text: "Dataset 2" },
        { value: 3, text: "Dataset 3" },
    ];

    // lifecycle functions
    onMount(async () => {
        data = getData();
        userDatasets.push(getData());
        userDatasets.push(getRandomData1(0.1, 0.3));
        userDatasets.push(getRandomData2(0.4, 0.6));
        userDatasets.push(getRandomData3(0.7, 1));
        selectedUserDataset = userDatasets[0];
        showData();
        createModel();
    });

    // functions

    // Model
    let createModel = () => {
        // Create a sequential model
        let model = tf.sequential();

        // Add a single input layer
        let inputConfig = {
            inputShape: [1],
            units: 1,
            useBias: true,
        };
        model.add(tf.layers.dense(inputConfig));

        // Add hidden layers
        let hiddenConfig = {
            units: hiddenLayerCount,
            useBias: true,
            // weights: [
            //     tf.randomUniform([1, hiddenLayerCount], minWeight, maxWeight),
            //     tf.randomUniform([hiddenLayerCount], minWeight, maxWeight),
            // ],
        };
        if (activationFunction != "none")
            hiddenConfig.activation = activationFunction;

        model.add(tf.layers.dense(hiddenConfig));

        // Add an output layer
        let outputConfig = {
            units: 1,
            useBias: true,
        };
        model.add(tf.layers.dense(outputConfig));

        model.weights.forEach((w) => {
            console.log(w.name, w.shape);
        });

        model.summary();

        return model;
    };

    // Data
    let getRandomData1 = (nMin, nMax) => {
        let dataArray = [];
        for (let i = 0; i < 1; i += 0.01) {
            let x = i; // Math.random() * (nMax - nMin) + nMin;
            let y = i + Math.random() * (nMax - nMin) + nMin;
            dataArray.push({ x: x, y: y });
        }
        return dataArray;
    };

    let getRandomData2 = (nMin, nMax) => {
        let dataArray = [];
        for (let i = 0; i < 1; i += 0.01) {
            let x = i; // Math.random() * (nMax - nMin) + nMin;
            dataArray.push({ x: x, y: calc2(x) });
        }
        return dataArray;
    };

    let getRandomData3 = (nMin, nMax) => {
        let dataArray = [];
        for (let i = 0; i < 1; i += 0.01) {
            let x = i; // Math.random() * (nMax - nMin) + nMin;
            // let y = i + Math.random() * (nMax - nMin) + nMin;
            dataArray.push({ x: x, y: calc3(x) });
        }
        return dataArray;
    };

    let getData = () => {
        let dataArray = [];
        for (let i = 0; i < 1; i += 0.0001) dataArray.push({ x: i, y: calc(i) });
        return dataArray;
    };

    let calc = (x) => {
        const ys = (x + 0.8) * (x - 0.2) * (x - 0.3) * (x - 0.6);
        return ys;
    };

    let calc2 = (x) => {
        const ys = x * x * x - 0.1 * x;
        return ys;
    };

    let calc3 = (x) => {
        const ys = x * x * x * -0.9 + 1 * x;
        return ys;
    };

    let prepareData = (data) => {
        return tf.tidy(() => {
            // Step 1. Shuffle the data
            // tf.util.shuffle(data);

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

    let showData = async () => {
        tfvis.render.scatterplot(
            userDataChart1,
            { values: userDatasets[0] },
            {
                xAxisDomain: [0, 1],
                yAxisDomain: [-0.5, 1],
                xLabel: "X",
                yLabel: "Y",
                height: 200,
                width: 400,
            }
        );

        tfvis.render.scatterplot(
            userDataChart2,
            { values: userDatasets[1] },
            {
                xAxisDomain: [0, 1],
                yAxisDomain: [-0.5, 1],
                xLabel: "X",
                yLabel: "Y",
                height: 200,
                width: 400,
            }
        );

        tfvis.render.scatterplot(
            userDataChart3,
            { values: userDatasets[2] },
            {
                xAxisDomain: [0, 1],
                yAxisDomain: [-0.5, 1],
                xLabel: "X",
                yLabel: "Y",
                height: 200,
                width: 400,
            }
        );

        tfvis.render.scatterplot(
            userDataChart4,
            { values: userDatasets[3] },
            {
                xAxisDomain: [0, 1],
                yAxisDomain: [-0.5, 1],
                xLabel: "X",
                yLabel: "Y",
                height: 200,
                width: 400,
            }
        );
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
    // Train
    export async function train() {
        training = true;

        // Create the model
        if (!model) model = createModel();

        // Get Data
        if (!data) data = getData();

        // Convert the data to a form we can use for training.
        const tensorData = prepareData(data);
        const { inputs, labels } = tensorData;

        // Train the model
        await trainModel(model, inputs, labels);
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
            shuffle: false,
            callbacks: tfvis.show.fitCallbacks(
                trainChart,
                // { name: "Training" },
                ["loss", "mse"],
                { height: 200, width: 400 }
            ),
        });
    };

    // Predict
    export async function predict() {
        running = true;

        // Create the model
        if (!model) model = createModel();
        // tfvis.show.modelSummary({ name: labelModel }, model);

        // Get Data
        if (!data) data = getData();

        // Get Data
        if (!selectedUserDataset) selectedUserDataset = userDatasets[0];

        // Convert the data to a form we can use for training.
        const tensorData = prepareData(data);
        // const { inputs, labels } = tensorData;

        // // Train the model
        // await train(model, inputs, labels);

        // Make some predictions using the model and compare them to the
        // original data
        testModel(model, selectedUserDataset, tensorData);
        running = false;
    }

    let testModel = (model, inputData, normalizationData) => {
        const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

        // Generate predictions for a uniform range of numbers between 0 and 1;
        // We un-normalize the data by doing the inverse of the min-max scaling
        // that we did earlier.
        const [xs, preds] = tf.tidy(() => {
            const xs = tf.linspace(0, 1, 100);
            const preds = model.predict(xs.reshape([100, 1]));

            const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin);

            const unNormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin);

            // Un-normalize the data
            return [unNormXs.dataSync(), unNormPreds.dataSync()];
        });

        const predictedPoints = Array.from(xs).map((val, i) => {
            return { x: val, y: preds[i] };
        });

        const originalPoints = inputData.map((d) => ({
            x: d.x,
            y: d.y,
        }));

        tfvis.render.scatterplot(
            predictChart,
            // { name: "Model Predictions vs Original Data" },
            {
                values: [originalPoints, predictedPoints],
                series: ["original", "predicted"],
            },
            {
                xAxisDomain: [0, 1],
                yAxisDomain: [-1, 2],
                xLabel: "X",
                yLabel: "Y",
                height: 400,
                width: 600,
            }
        );
    };

    // run
    export async function run() {
        training = true;
        running = true;

        // Create the model
        // if (!model)
        let model = createModel();
        // tfvis.show.modelSummary({ name: "FFNN" }, model);

        // Get Data
        let data = getData();

        // Convert the data to a form we can use for training.
        const tensorData = prepareData(data);
        const { inputs, labels } = tensorData;

        // Train the model
        await trainModel(model, inputs, labels);
        training = false;

        // Get Data
        if (!selectedUserDataset) return; //selectedUserDataset = userDatasets[0];
        const tensorData2 = prepareData(selectedUserDataset);

        // Make some predictions using the model and compare them to the
        // original data
        testModel(model, selectedUserDataset, tensorData2);
        running = false;
    }

    export async function run2() {
        training = true;
        running = true;

        // Create the model
        // if (!model)
        let model = createModel();
        tfvis.show.modelSummary({ name: "FFNN" }, model);

        // Get Data
        if (!selectedUserDataset) return; //selectedUserDataset = userDatasets[0];

        // Convert the data to a form we can use for training.
        const tensorData = prepareData(selectedUserDataset);
        const { inputs, labels } = tensorData;

        // Train the model
        await trainModel(model, inputs, labels);
        training = false;

        // Make some predictions using the model and compare them to the
        // original data
        testModel(model, selectedUserDataset, tensorData);
        running = false;
    }
</script>

<h3>{labelDatasets}</h3>
<div class="grid">
    <div>
        <h5>{selectUserDatasets[0].text}</h5>
        <div id="user_data_chart1" bind:this={userDataChart1} />
    </div>
    <div>
        <h5>{selectUserDatasets[1].text}</h5>
        <div id="user_data_chart2" bind:this={userDataChart2} />
    </div>
    <div>
        <h5>{selectUserDatasets[2].text}</h5>
        <div id="user_data_chart3" bind:this={userDataChart3} />
    </div>
    <div>
        <h5>{selectUserDatasets[3].text}</h5>
        <div id="user_data_chart4" bind:this={userDataChart4} />
    </div>
</div>

<br />

<h3>{labelFFNN}</h3>
<div class="grid">
    <div>
        <h5>{labelSettinngs}</h5>
        <div class="settings">
            <Select
                label={labelUserdataset}
                items={selectUserDatasets}
                on:change={(v) => {
                    itemSelected = true;
                    selectedUserDataset = userDatasets[v.detail];
                }}
            />

            <h6>{labelBatchSize}: {batchSize}</h6>
            <Slider
                min="32"
                step="30"
                max="512"
                bind:value={batchSize}
                disabled={running || training}
            />

            <h6>{labelEpoch}: {epochs}</h6>
            <Slider
                min="10"
                step="10"
                max="200"
                bind:value={epochs}
                disabled={running || training}
            />

            <h6>{labelHiddenLayer}: {hiddenLayerCount}</h6>
            <Slider
                min="1"
                step="1"
                max="50"
                bind:value={hiddenLayerCount}
                disabled={running || training}
            />

            <h6>{labelMinWeight}: {minWeight}</h6>
            <Slider
                min="0"
                step=".1"
                max="1"
                bind:value={minWeight}
                disabled={running || training}
            />

            <h6>{labelMaxWeight}: {maxWeight}</h6>
            <Slider
                min="0"
                step=".1"
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

            <h6>{labelLearningRate}: {learningRate}</h6>
            <Slider
                min=".001"
                step=".001"
                max=".1"
                bind:value={learningRate}
                disabled={running || training}
            />

            {#if running}
                <ProgressCircular />
            {/if}

            <Button
                block
                outlined
                on:click={run}
                disabled={running || training || !itemSelected}
            >
                train & predict
            </Button>
        </div>
    </div>

    <div>
        <h5>{labelTraining}</h5>
        <div id="train_chart" bind:this={trainChart} />
    </div>

    <div>
        <h5>{labelPrediction}</h5>
        <div id="predict_chart" bind:this={predictChart} />
    </div>
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        column-gap: 20px;
        row-gap: 20px;
        justify-items: center;
    }

    .settings {
        max-width: 300px;
    }
</style>
