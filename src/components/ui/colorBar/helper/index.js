import * as d3 from 'd3';

const COLOR_MAP = {
  rdylgn: d3.interpolateRdYlGn, //imerg
  turbo: d3.interpolateTurbo, //sst
  bupu_r: (t) => d3.interpolateBuPu(t), //viirs,modis
  viridis: d3.interpolateViridis, //cygnss
  greys_r: (t) => d3.interpolateGreys(1 - t), //goes02 (reversed)
  cubehelix: d3.interpolateCubehelixDefault, //goes13
  magma: d3.interpolateMagma,
  reds: d3.interpolateReds,
  gist_earth: (t) => d3.interpolateGreys(1 - t), // (reversed)
  default: d3.interpolatePlasma,
  plasma: d3.interpolatePlasma,
};

/*
      Create colorbar as a legend
      
      @param {object} colorbar - instance of the colorbar objects
      @param {number} VMIN - minimum value of the color index
      @param {number} VMAX - maximum value of the color index
      @param {number} STEP - stepsize of  scale 
      @param {string} colormap - name of the colormap
     
*/

export const createColorbar = (colorbar, VMIN, VMAX, STEP, colormap) => {
  // Create a color scale using D3
  const colorScale = d3
    .scaleSequential(COLOR_MAP[colormap])
    .domain([VMIN, VMAX]); // Set VMIN and VMAX as your desired min and max values

  colorbar
    .append('svg')
    .attr('class', 'colorbar-svg')
    .append('g')
    .selectAll('rect')
    .data(d3.range(VMIN, VMAX, (VMAX - VMIN) / 100)) // Adjust the number of color segments as needed
    .enter()
    .append('rect')
    .attr('height', 12) // height of the svg color segment portion
    .attr('width', '100%') // Adjust the width of each color segment
    .attr('x', (d, i) => i * 3)
    .attr('fill', (d) => colorScale(d));

  // Define custom scale labels
  const scaleLabels = generateScale(VMIN, VMAX, STEP);

  // Create a container for color labels
  colorbar
    .append('div')
    .attr('class', 'colorbar-scale-tick-label-container')
    .selectAll('div')
    .data(scaleLabels)
    .enter()
    .append('div')
    .attr('class', 'colorbar-scale-tick-label')
    .text((d) => d); // Set the tick label text
};

function generateScale(min, max, step) {
  const numbers = [];

  const roundingBase =
    step > 0 ? Math.pow(10, Math.floor(Math.log10(step))) : 1;

  for (let i = min; i <= max; i += step) {
    // Round the calculated tick value to the determined base
    const roundedValue = Math.round(i / roundingBase) * roundingBase;
    numbers.push(roundedValue);
  }

  // Filter out duplicate values that might result from rounding
  const uniqueNumbers = [...new Set(numbers)];

  if (uniqueNumbers.length > 0) {
    uniqueNumbers[uniqueNumbers.length - 1] += '+';
  }
  return uniqueNumbers;
}

