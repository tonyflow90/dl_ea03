<script>
    // svelte
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    // Events
    let predicting = false;
    let training = false;
    let error;

    // Props

    // Data
    let trainingData;

    // Model
    export let modelName = "TFModel";
    export let model;

    // Props training
    export let showTraining = true;
    export let chart = undefined;
    export let batchSize = 32; // Neuronen min 32 max 512
    export let epochs = 10; // Trainings Epochen 50 iterations
    export let hiddenLayerCount = 1; // Anzahl der hidden Layer
    export let minWeight = 0;
    export let maxWeight = 1;
    export let activationFunction = "none";
    export let selectedOptimizer = "sgd"; // Optimizer
    export let learningRate = 0.001; // Lernrate
    export let neuronCount = 1;

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
        // try {
        //     model = await loadModel(modelName);
        // } catch (error) {
        //     console.warn(error);
        // }

        if (!model) model = createModel();
    });

    // functions

    // Model
    let createModel = () => {
        // Create a sequential model
        let model = tf.sequential();

        let weights = [
            tf.randomUniform([1, neuronCount], 0, 1),
            tf.randomUniform([neuronCount], minWeight, maxWeight),
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

        // weights = [
        //     tf.randomUniform([1, neuronCount], 0, 1),
        //     tf.randomUniform([neuronCount], minWeight, maxWeight),
        // ];

        // Add a hidden layer
        let hiddenConfig = {
            name: "hiddenlayer",
            units: neuronCount,
            // weights: weights,
            useBias: true,
        };
        if (activationFunction != "none")
            inputConfig.activation = activationFunction;

        for (let i = 0; i < hiddenLayerCount; i++) {
            hiddenConfig.name = "hiddenlayer_" + i;
            let hiddenLayer = tf.layers.dense(hiddenConfig);
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

    // Train
    export async function train(data) {
        dispatch("training", true);

        // create model with new parms
        model = createModel();

        // set training data
        trainingData = data;

        // Convert the data to a form we can use for training.
        const tensorData = prepareData(trainingData);
        const { inputs, labels } = tensorData;

        // Train the model
        const optimizer = getOptimizer(selectedOptimizer, learningRate);

        // Prepare the model for training.
        model.compile({
            optimizer: optimizer,
            loss: tf.losses.meanSquaredError,
            metrics: ["mse"],
        });

        await model.fit(inputs, labels, {
            batchSize,
            epochs,
            shuffle: true,
            callbacks: showTraining
                ? tfvis.show.fitCallbacks(
                      chart ? chart : { name: "Training Performance" },
                      ["val_loss", "loss", "val_mse", "mse"],
                      {
                          yAxisDomain: [0, 0.1],
                          height: 200,
                          width: 400,
                          callbacks: ["onEpochEnd"],
                      }
                  )
                : undefined,
        });

        // saveModel(model, modelName);
        dispatch("training", false);
    }

    // Predict
    // export async function predict(inputData) {
    //     dispatch("predicting", true);

    //     const normalizationData = prepareData(inputData);
    //     const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

    //     // const points = inputData.map((d) => {
    //     //     let it = tf.tensor2d([d.x], [1, 1]);
    //     //     let y = model.predict(it);
    //     //     return {x: d.x, y: y.dataSync()};
    //     // });

    //     const [x, y] = tf.tidy(() => {
    //         let ys = [];
    //         inputData.forEach(d => {
    //             let it = tf.tensor2d([d.x], [1, 1]);
    //             let y = model.predict(it);
    //             ys.push(y.dataSync()[0])
    //         });
    //         debugger;
    //         return [inputData.map((d) => d.x), ys];
    //     });

    //     debugger;
    //     const inputs = inputData.map((d) => d.x);

    //     Array.from(inputs)
    //     const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);

    //     // const normalizedInputs = inputTensor;
    //     // .sub(inputMin)
    //     // .div(inputMax.sub(inputMin));

    //     // const [x, y] = tf.tidy(() => {
    //     //     debugger;
    //     //     const ys = model.predict(inputTensor);
    //     //     return [inputTensor.dataSync(), ys.dataSync()];
    //     // });

    //     // let points = Array.from(inputTensor.dataSync()).map((val, i) => {
    //     //     return { x: val, y: model.predict(val) };
    //     // });

    //     const predictedPoints = await Array.from(x).map((val, i) => {
    //         return { x: val, y: y[i] };
    //     });

    //     dispatch("predicting", false);
    //     return predictedPoints;
    // }

    // // Predict
    // export async function predict(inputData) {
    //     dispatch("predicting", true);

    //     const normalizationData = prepareData(inputData);
    //     const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

    //     const inputs = inputData.map((d) => d.x);
    //     const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);

    //     const [x, y] = tf.tidy(() => {
    //         const ys = model.predict(inputTensor);
    //         return [inputTensor.dataSync(), ys.dataSync()];
    //     });

    //     const predictedPoints = await Array.from(x).map((val, i) => {
    //         return { x: val, y: y[i] };
    //     });

    //     dispatch("predicting", false);
    //     return predictedPoints;
    // }

    // Predict
    export async function predict(inputData, trainingData) {
        dispatch("predicting", true);

        const normalizationData = prepareData(trainingData);
        const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

        const inputs = inputData.map((d) => d.x);
        const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);

        const normalizedInputs = inputTensor
            .sub(inputMin)
            .div(inputMax.sub(inputMin));

        const [x, y] = tf.tidy(() => {
            const ys = model.predict(normalizedInputs);

            const unNormXs = normalizedInputs
                .mul(inputMax.sub(inputMin))
                .add(inputMin);
            const unNormPreds = ys.mul(labelMax.sub(labelMin)).add(labelMin);

            // Un-normalize the data
            return [unNormXs.dataSync(), unNormPreds.dataSync()];
        });

        const predictedPoints = await Array.from(x).map((val, i) => {
            return { x: val, y: y[i] };
        });

        dispatch("predicting", false);
        return predictedPoints;
    }

    // Predict
    export async function predict2(inputData) {
        dispatch("predicting", true);

        const normalizationData = prepareData(inputData);
        const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

        const inputs = inputData.map((d) => d.x);
        const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);

        const normalizedInputs = inputTensor
            .sub(inputMin)
            .div(inputMax.sub(inputMin));

        const [x, y] = tf.tidy(() => {
            const ys = model.predict(normalizedInputs);

            const unNormXs = normalizedInputs
                .mul(inputMax.sub(inputMin))
                .add(inputMin);
            const unNormPreds = ys.mul(labelMax.sub(labelMin)).add(labelMin);

            // Un-normalize the data
            return [unNormXs.dataSync(), unNormPreds.dataSync()];
        });

        const predictedPoints = await Array.from(x).map((val, i) => {
            return { x: val, y: y[i] };
        });

        dispatch("predicting", false);
        return predictedPoints;
    }
</script>
