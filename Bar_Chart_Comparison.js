d3.csv("jobs_in_data.csv").then(function(data) {
    data.forEach(d => {
        d.salary_in_usd = +d.salary_in_usd; 
    });

    const aggregatedData = Array.from(d3.rollup(data, 
        v => d3.mean(v, d => d.salary_in_usd), 
        d => d.job_category 
    ), ([job_category, salary_in_usd]) => ({job_category, salary_in_usd}));

    aggregatedData.sort((a, b) => d3.descending(a.salary_in_usd, b.salary_in_usd));

    const margin = {top: 30, right: 200, bottom: 50, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#bargraphSVG")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(aggregatedData.map(d => d.job_category));
    y.domain([0, d3.max(aggregatedData, d => d.salary_in_usd)]);

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-40)")
            .attr("font-weight", "bold");

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format("$.2s")))
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Average Salary (USD)");

    g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    g.selectAll(".bar")
        .data(aggregatedData)
        .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.job_category))
            .attr("y", d => y(d.salary_in_usd))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.salary_in_usd))
            .attr("fill", (d, i) => colorScale(i)) 
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.job_category + "<br/>" + "$" + d.salary_in_usd.toFixed(2))
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Salary (USD)");

    svg.append("text")
        .attr("transform", `translate(${(width + margin.left + margin.right) / 2}, 30)`)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text("Average Salary by Job Category");
});
