<script>
    // svelte
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    // libraries

    // Props
    // let name = "My Model";
    // let batchSize = 32; // min 32 max 512
    // let epochs = 50; // 50 iterations
    // let url = "https://storage.googleapis.com/tfjs-tutorials/carsData.json";

    export let modelName;
    export let batchSize; // min 32 max 512
    export let epochs; // 50 iterations
    export let url;

    export let running;
    export let opened;

    // events
    $: running, dispatch("running", running);
    // $: tfvis.visor().isOpen(), dispatch("opened", tfvis.visor().isOpen());

    // Data
    let getData = async () => {
        const carsDataResponse = await fetch(
            "https://storage.googleapis.com/tfjs-tutorials/carsData.json"
        );
        const carsData = await carsDataResponse.json();
        const cleaned = carsData
            .map((car) => ({
                mpg: car.Miles_per_Gallon,
                horsepower: car.Horsepower,
            }))
            .filter((car) => car.mpg != null && car.horsepower != null);

        return cleaned;
    };

    // functions
    let createModel = () => {
        // Create a sequential model
        const model = tf.sequential();

        // Add a single input layer
        model.add(
            tf.layers.dense({ inputShape: [1], units: 1, useBias: true })
        );

        // Add an output layer
        model.add(tf.layers.dense({ units: 1, useBias: true }));

        return model;
    };

    let trainModel = async (model, inputs, labels) => {
        // Prepare the model for training.
        model.compile({
            optimizer: tf.train.adam(),
            loss: tf.losses.meanSquaredError,
            metrics: ["mse"],
        });

        // return await model.fit(inputs, labels, {
        //     batchSize,
        //     epochs,
        //     shuffle: true,
        //     callbacks: dispatch("traning", {done: true, text: "Tarining Done"})
        // });
        return await model.fit(inputs, labels, {
            batchSize,
            epochs,
            shuffle: true,
            callbacks: tfvis.show.fitCallbacks(
                { name: "Training Performance" },
                ["loss", "mse"],
                { height: 200, callbacks: ["onEpochEnd"] }
            ),
        });
    };

    let convertToTensor = (data) => {
        // Wrapping these calculations in a tidy will dispose any
        // intermediate tensors.

        return tf.tidy(() => {
            // Step 1. Shuffle the data
            tf.util.shuffle(data);

            // Step 2. Convert data to Tensor
            const inputs = data.map((d) => d.horsepower);
            const labels = data.map((d) => d.mpg);

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
            x: d.horsepower,
            y: d.mpg,
        }));

        tfvis.render.scatterplot(
            { name: "Model Predictions vs Original Data" },
            {
                values: [originalPoints, predictedPoints],
                series: ["original", "predicted"],
            },
            {
                xLabel: "Horsepower",
                yLabel: "MPG",
                height: 300,
            }
        );
    };

    export async function run() {
        running = true;

        // Create the model
        const model = createModel();
        // tfvis.show.modelSummary({ name: modelName }, model);

        // Get Data
        const data = await getData(url);

        // Convert the data to a form we can use for training.
        const tensorData = convertToTensor(data);
        const { inputs, labels } = tensorData;

        // Train the model
        await trainModel(model, inputs, labels);
        running = false;
        console.log("Done Training");

        // Make some predictions using the model and compare them to the
        // original data
        testModel(model, data, tensorData);
    }

    export async function show() {
        if (!tfvis.visor().isOpen()) tfvis.visor().toggle();
    }
</script>
