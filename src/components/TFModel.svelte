<script context="module">
    // svelte
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    // Events
    let predicting = false;
    let training = false;
    let error;

    $: training, dispatch("training", training);
    $: running, dispatch("running", running);

    // Props

    // Data
    let trainingData;

    // Model
    let modelName = "TFModel";
    let model;

    // Props training
    let batchSize = 32; // Neuronen min 32 max 512
    let epochs = 10; // Trainings Epochen 50 iterations
    let hiddenLayerCount = 1; // Anzahl der hidden Layer
    let activationFunction = "none";
    let selectedOptimizer = "sgd"; // Optimizer
    let learningRate = 0.001; // Lernrate
    let neuronCount = 1;

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
    onMount(async () => {
        if (!model && modelName) {
            model = loadModel(modelName);
        } else {
            initModel();
        }
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

    let prepareData = (data) => {
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

    // Model
    export function initModel() {
        model = createModel();
        saveModel(model);
    }

    // Train
    export async function train() {
        dispatch("training", true);

        // Convert the data to a form we can use for training.
        const tensorData = prepareData(trainingData);
        const { inputs, labels } = tensorData;

        // Train the model
        await trainModel(model, inputs, labels);
        saveModel(model, modelName);
        dispatch("training", false);
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
                    yAxisDomain: [0, 0.1],
                    height: 200,
                    width: 400,
                    callbacks: ["onEpochEnd"],
                }
            ),
        });
    };

    // Predict
    export async function predict(data) {
        dispatch("predicting", true);

        // Convert the data to a form we can use for training.
        const tensorData = prepareData(data);

        // Make some predictions using the model and compare them to the
        // original data
        testModel(model, data, tensorData);
        dispatch("predicting", false);
    }

    let testModel = (model, inputData, normalizationData) => {
        const { inputs, inputMax, inputMin, labelMin, labelMax } =
            normalizationData;

        const [x, y] = tf.tidy(() => {
            // const aInputX = inputData.map((d) => d.x);
            // const xs = tf.tensor2d(aInputX, [aInputX.length, 1]);
            // const yun = model.predict(x);
            const ys = model.predict(inputs);

            const unNormXs = inputs.mul(inputMax.sub(inputMin)).add(inputMin);
            const unNormPreds = ys.mul(labelMax.sub(labelMin)).add(labelMin);

            // Un-normalize the data
            return [unNormXs.dataSync(), unNormPreds.dataSync()];
        });

        // const aInputX = inputData.map((d) => d.x);
        // const xTensor = tf.tensor2d(aInputX, [aInputX.length, 1]);
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
