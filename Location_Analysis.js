document.addEventListener('DOMContentLoaded', function () {
    const svg = d3.select("#mapSVG");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
  
    const projection = d3.geoMercator()
      .scale(175)
      .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);
  
    let tooltip = d3.select("#tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip")
        .style("display", "none")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "5px");
    }
  
    const legend = d3.select("#mapContainer").append("div")
      .attr("class", "legend")
      .style("position", "absolute")
      .style("bottom", "10px")
      .style("left", "10px")
      .style("background", "#fff")
      .style("padding", "10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "5px");
  
    const countryNameToCode = {
      "United States": "United States of America",
    };
  
    let colorScale;
  
    Promise.all([
      d3.json('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'),
      d3.csv('jobs_in_data.csv')
    ]).then(function ([geojson, data]) {
      const modifiedData = data.map(d => ({
        ...d,
        company_location: countryNameToCode[d.company_location] || d.company_location
      }));
  
      // New Vibrant Color Palette
      const colorRanges = [0, 20000, 40000, 60000, 80000, 100000, 120000];
      const colorPalette = ["#ffffcc", "#ffeda0", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026", "#67000d"];
      colorScale = d3.scaleThreshold()
        .domain(colorRanges)
        .range(colorPalette);
  
      // Legend Update
      legend.html(`
        <h4>Salary Range</h4>
        ${colorRanges.map((val, i) => `
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="background: ${colorPalette[i]}; height: 10px; width: 20px; margin-right: 5px;"></div>
            <span>${val}${i < colorRanges.length - 1 ? ` - ${colorRanges[i + 1]}` : '+'}</span>
          </div>
        `).join('')}
      `);
  
      function drawMap(dataForMap) {
        svg.selectAll("path")
          .data(geojson.features)
          .join("path")
          .attr("d", path)
          .attr("fill", d => {
            const countryName = d.properties.name;
            const countryData = dataForMap.filter(d => d.company_location === countryName);
            const countryAverageSalary = d3.mean(countryData, d => +d.salary_in_usd);
            return colorScale(countryAverageSalary || 0);
          })
          .attr("stroke", "#000")
          .attr("stroke-width", "0.5px")
          .on("mouseover", (event, d) => {
            const countryName = d.properties.name;
            const countryData = dataForMap.filter(d => d.company_location === countryName);
            const countryAverageSalary = d3.mean(countryData, d => +d.salary_in_usd);
  
            d3.select(event.target).attr("stroke-width", "2px");
  
            tooltip.style("display", "block")
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px")
              .html(`
                <strong>${countryName}</strong><br>
                Average Salary: $${countryAverageSalary ? countryAverageSalary.toFixed(2) : 'N/A'}<br>
                Number of Jobs: ${countryData.length}
              `);
          })
          .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px");
          })
          .on("mouseout", event => {
            tooltip.style("display", "none");
            d3.select(event.target).attr("stroke-width", "0.5px");
          });
  
        console.log("Map drawn or updated.");
      }
  
      document.getElementById('year2020').addEventListener('click', () => drawMap(modifiedData.filter(d => d.work_year.toString() === "2020")));
      document.getElementById('year2021').addEventListener('click', () => drawMap(modifiedData.filter(d => d.work_year.toString() === "2021")));
      document.getElementById('year2022').addEventListener('click', () => drawMap(modifiedData.filter(d => d.work_year.toString() === "2022")));
      document.getElementById('year2023').addEventListener('click', () => drawMap(modifiedData.filter(d => d.work_year.toString() === "2023")));
  
      drawMap(modifiedData);
    });
  
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);
  
    svg.call(zoom);
  
    function zoomed(event) {
      const { transform } = event;
      projection.scale(150 * transform.k).translate([transform.x, transform.y]);
      svg.selectAll("path").attr("d", path);
      svg.selectAll("text").attr("transform", d => {
        const centroid = path.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]}) scale(${transform.k})`;
      }).attr("font-size", d => 8 / transform.k + "px");
    }
  });
  