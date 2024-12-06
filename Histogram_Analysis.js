d3.csv("jobs_in_data.csv").then(function(data) {
    // Parse the data
    data.forEach(function(d) {
        d.work_year = +d.work_year;
        d.salary_in_usd = +d.salary_in_usd;
    });

    // Process the data for visualization
    var processedData = d3.rollups(data,
        v => d3.mean(v, d => d.salary_in_usd),
        d => d.work_year,
        d => d.job_category
    ).map(([year, categoriesMap]) => ({
        year,
        categories: Array.from(categoriesMap, ([category, average_salary]) => ({category, average_salary}))
    }));

    // Set up dimensions
    const margin = {top: 10, right: 220, bottom: 50, left: 60},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create a container for the chart and legend
    const container = d3.select("#my_dataviz")
        .style("display", "flex")
        .style("gap", "20px") // Add space between chart and legend
        .style("align-items", "flex-start"); // Align top of the chart and buttons

    // Create SVG container for the chart
    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(0,0,0,0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none");

    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.work_year))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    const y = d3.scaleLinear()
        .domain([0, 250000]) 
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Vibrant color palette for job categories
    const vibrantColors = [
        "#FF5733", "#33FFBD", "#FF33A8", "#3357FF", "#33FF57", "#FF8C33", 
        "#D833FF", "#33FFF5", "#FFC733", "#B633FF", "#33FF96", "#FF336F"
    ];

    // Assign colors dynamically
    const categories = Array.from(new Set(data.map(d => d.job_category))); // Extract unique categories
    const color = d3.scaleOrdinal()
        .domain(categories)
        .range(vibrantColors);

    // Store all the lines as a map with category as key
    const linesMap = new Map();

    // Draw lines for each category
    processedData.forEach(function(yearData) {
        yearData.categories.forEach(function(categoryData) {
            const { category } = categoryData;
            let dataForLine = processedData.map(function(e) {
                let cat = e.categories.find(c => c.category === category);
                return cat ? { year: e.year, average_salary: cat.average_salary, category } : null;
            }).filter(e => e);

            const line = d3.line()
                .x(d => x(d.year))
                .y(d => y(d.average_salary))
                .curve(d3.curveMonotoneX);

            const linePath = svg.append("path")
                .datum(dataForLine)
                .attr("class", "line " + category.replace(/\s+/g, "-"))
                .attr("fill", "none")
                .attr("stroke", color(category)) // Use vibrant colors
                .attr("stroke-width", 3) 
                .attr("d", line);

            linesMap.set(category, linePath); // Store the line in the map for toggling visibility
            linePath.style("opacity", 0); // Initially hide all lines
        });
    });

    // Create dropdown for category selection
    const dropdownContainer = container.append("div")
        .attr("class", "dropdown-container")
        .style("margin-top", "10px");

    const dropdown = dropdownContainer.append("select")
        .attr("class", "category-dropdown")
        .style("padding", "10px")
        .style("font-size", "14px")
        .style("cursor", "pointer")
        .style("border-radius", "5px")
        .style("width", "200px");

    // Add "All" option to dropdown
    dropdown.append("option")
        .attr("value", "All")
        .text("All");

    // Add category options to dropdown
    categories.forEach(category => {
        dropdown.append("option")
            .attr("value", category)
            .text(category);
    });

    // Handle dropdown change
    dropdown.on("change", function() {
        const selectedCategory = this.value;

        if (selectedCategory === "All") {
            // Show all lines when "All" is selected
            linesMap.forEach((line) => {
                line.transition()
                    .duration(300)
                    .style("opacity", 1); // Show all lines
            });
        } else {
            // Show only the selected category's line
            linesMap.forEach((line, categoryKey) => {
                if (categoryKey === selectedCategory) {
                    line.transition()
                        .duration(300)
                        .style("opacity", 1); // Show the selected category line
                } else {
                    line.transition()
                        .duration(300)
                        .style("opacity", 0); // Hide the other lines
              }
            });
        }
    });

    // Add tooltip on hover
    svg.selectAll(".line")
        .on("mouseover", function(event, data) {
            div.transition()
                .duration(200)
                .style("opacity", .9);

            const mouseX = x.invert(d3.pointer(event)[0]);
            const closest = data.reduce((prev, curr) => 
                (Math.abs(curr.year - mouseX) < Math.abs(prev.year - mouseX) ? curr : prev));

            div.html("Category: " + closest.category + "<br/>Year: " + closest.year + "<br/>Avg Salary: $" + Math.round(closest.average_salary))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        }).on("mouseout", function() {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
});
