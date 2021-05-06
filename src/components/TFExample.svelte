<script>
  // ui
  import { Tooltip, Slider, Card, Snackbar, Button } from "smelte";

  // svelte
  import { onMount } from "svelte";

  // libraries
  // import * as tf from "@tensorflow/tfjs";
  // import * as tfvis from "@tessorflow/tfjs-vis";

  // Props

  // Data

  // functions
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

  let run = async () => {
    // Load and plot the original input data that we are going to train on.
    const data = await getData();
    const values = data.map((d) => ({
      x: d.horsepower,
      y: d.mpg,
    }));

    tfvis.render.scatterplot(
      { name: "Horsepower v MPG" },
      { values },
      {
        xLabel: "Horsepower",
        yLabel: "MPG",
        height: 300,
      }
    );

    debugger;

    // More code will be added below
  };

  let onError = (e) => {
    showSnackbar = true;
    message = e.detail.message;
    snackbarColor = "error";
  };
</script>

<Button on:click={run}>RUN</Button>

<style>
</style>
