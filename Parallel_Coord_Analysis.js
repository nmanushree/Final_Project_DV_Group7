const margin = { top: 30, right: 150, bottom: 10, left: 0 }, 
      width = 810 - margin.left - margin.right,
      height = 490 - margin.top - margin.bottom;

const svg = d3.select("#parallelPlot svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const experienceLevelMapping = {
    "entry-level": "Entry-Level",
    "executive": "Executive",
    "mid-level": "Mid-Level",
    "senior": "Senior"
};
const experienceLevels = ["Entry-Level", "Executive", "Mid-Level", "Senior"]; // Removed "Other"

// Neat color scale (clean, soft, and elegant colors)
const colorScale = d3.scaleOrdinal()
                     .domain(experienceLevels)
                     .range(["#3498db", "#e74c3c", "#2ecc71", "#f39c12"]); // Soft colors

d3.csv("jobs_in_data.csv").then(function (data) {
    // Normalize and map experience level to ensure it's consistent
    data.forEach(d => {
        let normalizedLevel = d.experience_level.trim().toLowerCase().replace(/[^a-z\-]/g, "");
        d.experience_level = experienceLevelMapping[normalizedLevel] || "Other"; // Ensure 'Other' is correctly mapped
    });

    const dimensions = ['work_year', 'salary_in_usd']; 
    const y = {};
    dimensions.forEach(dimension => {
        y[dimension] = d3.scaleLinear()
                         .domain(d3.extent(data, d => +d[dimension]))
                         .range([height, 0])
                         .nice(); 
    });

    const x = d3.scalePoint()
                .range([0, width])
                .padding(0.5)
                .domain(dimensions);

    // Add paths with smoother transitions and more dynamic effects
    const paths = svg.selectAll("myPath")
       .data(data)
       .enter().append("path")
       .attr("d", d => path(d, dimensions, x, y))
       .style("stroke", d => colorScale(d.experience_level))  // Ensure color scale is used here
       .style("stroke-width", 2)  // Thicker lines for better visibility
       .style("fill", "none")     // No fill for the paths
       .classed("line", true)
       .style("opacity", 1);  // Initial opacity for all paths

    // Add axes with improved labels
    svg.selectAll("myAxis")
       .data(dimensions)
       .enter()
       .append("g")
       .attr("class", "axis")
       .attr("transform", d => `translate(${x(d)})`)
       .each(function(d) {
           d3.select(this).call(d3.axisLeft(y[d]).tickFormat(d === 'work_year' ? d3.format('d') : null));
       })
       .append("text")
       .style("text-anchor", "middle")
       .attr("y", -9)
       .style("font-size", "14px")  // Clearer font size
       .text(d => {
           if (d === 'work_year') return 'Year of Work'; // Custom x-axis label
           if (d === 'salary_in_usd') return 'Salary in USD'; // Custom y-axis label
       })
       .style("fill", "#555");

    // Create and style the legend as buttons
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 25})`);  // More space between items

    // Create buttons for each experience level with the correct color
    legend.append("rect")
        .attr("x", width - 40)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", d => colorScale(d))  // Color matching between legend and chart
        .style("cursor", "pointer") // Make the rect look clickable
        .on("click", function(event, d) {
            toggleVisibility(d); // Toggle visibility for the clicked level
        });

    legend.append("text")
        .attr("x", width - 10)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text(d => d)
        .style("fill", "#333");

    // Function to toggle visibility of the paths based on experience level
    function toggleVisibility(experienceLevel) {
        paths.style("opacity", function(d) {
            return d.experience_level === experienceLevel ? 1 : 0; // Only show selected level
        });
    }

    // Add an "All" button to show all paths
    const allButton = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(0,${experienceLevels.length * 25})`);  // Position it below the other buttons

    allButton.append("rect")
        .attr("x", width - 40)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "#7f8c8d") // A neutral color for "All"
        .style("cursor", "pointer")
        .on("click", function() {
            paths.style("opacity", 1); // Show all lines
        });

    allButton.append("text")
        .attr("x", width - 10)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text("All")
        .style("fill", "#333");

});

function path(d, dimensions, x, y) {
    return d3.line()(dimensions.map(p => [x(p), y[p](d[p])]));
}
