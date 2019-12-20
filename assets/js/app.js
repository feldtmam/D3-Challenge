function handleResize() {
    var svgArea = d3.select("svg");

    // check fro an exisitng svg container - remove if present
    if (!svgArea.empty()) {
        svgArea.remove();
        create_chart();
    }
}

function create_chart() {

    // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data/data.csv", function(err, inputData) {
        if (err) throw err;

        console.log(inputData);

        // parse data
        inputData.forEach(function(d) {
            d.obesity = +d.obesity;
            d.income = +d.income;
            d.smokes = +d.smokes;
            d.age = +d.age;
            d.healthcare = +d.healthcare;
            d.poverty = +d.poverty;

        });


        // use the window width and height for the SVG area
        var svgWidth = window.innerWidth;
        var svgHeight = window.innerHeight;
        var margin = {
            top: 20,
            right: 40,
            bottom: 100,
            left: 100
        };
        var width = parseInt(d3.select('#scatter')
            .style("width"));
        var height = width * 2 / 3;


        // create the SVG wrapper
        var svg = d3
            .select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        // Append an SVG group
        var chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Initial Params
        var select_xaxis = "poverty";
        var select_yaxis = "healthcare";


        function xScale(inputData, select_xaxis) {
            // create scales
            var xLinearScale = d3.scaleLinear()
                .domain([d3.min(inputData, d => d[select_xaxis]) * 0.8,
                    d3.max(inputData, d => d[select_xaxis]) * 1.2
                ])
                .range([0, width]);

            return xLinearScale;

        }

        function renderAxesX(newXScale, xAxis) {
            var bottomAxis = d3.axisBottom(newXScale);

            xAxis.transition()
                .duration(1000)
                .call(bottomAxis);

            return xAxis;
        }


        function yScale(inputData, select_yaxis) {
            //create scales
            var yLinearScale = d3.scaleLinear()
                .domain([d3.min(inputData, d => d[select_yaxis]) * 0.8,
                    d3.max(inputData, d => d[select_yaxis]) * 1.2
                ])
                .range([height, 0]);

            return yLinearScale;
        }


        function renderAxesY(newYScale, yAxis) {
            var leftAxis = d3.axisLeft(newYScale);

            yAxis.transition()
                .duration(1000)
                .call(leftAxis);

            return yAxis;
        }

        function renderCircles(circlesGroup, newXScale, select_xaxis, newYScale, select_yaxis) {

            circlesGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[select_xaxis]))
                .attr("cy", d => newYScale(d[select_yaxis]));

            return circlesGroup;
        }

        function renderText(textGroup, newXScale, select_xaxis, newYScale, select_yaxis) {

            textGroup.transition()
                .duration(1000)
                .attr("x", d => newXScale(d[select_xaxis]))
                .attr("y", d => newYScale(d[select_yaxis]));

            return textGroup;
        }

        function updateToolTip(select_xaxis, select_yaxis, circlesGroup) {

            if (select_xaxis === "poverty") {
                var xLabel = "Poverty:";
            } else if (select_xaxis === "age") {
                var xLabel = "Median Age:";
            } else {
                var xLabel = "Median Income:";
            }

            if (select_yaxis === "healthcare") {
                var yLabel = "Lack Healthcare:";
            } else if (select_yaxis === "smokes") {
                var yLabel = "Smokes:";
            } else {
                var yLabel = "Obese:";
            }

            //create tooltip
            var toolTip = d3.tip()
                .attr("class", "tooltip")
                .offset([-10, 0])
                .html(function(d) {
                    //Build text box
                    // var stateLine = `<div>${d.state}</div>`;
                    // var yLine = `<div>${yLabel}: ${d[select_yaxis]}%</div>`;
                    // if (xLabel === "poverty") {
                    //     xLine = `<div>${xLabel}: ${d[select_xaxis]}%</div>`
                    // } else {
                    //     xLine = `<div>${xLabel}: ${parseFloat(d[xLabel]).toLocaleString("en")}</div>`;
                    // }
                    // return stateLine + xLine + yLine
                    return (`${d.state}<br>${xLabel} ${d[select_xaxis]}<br>${yLabel} ${d[select_yaxis]}%`);
                });

            circlesGroup.call(toolTip);

            // add event
            circlesGroup
            // onmouseover event
                .on("mouseover", function(d, index) {
                    toolTip.show(d);
                    d3.select(this).attr("r", 20).style("fill", "red").attr("text-align", "center").ease("cubic");
                })
                // onmouseout event
                .on("mouseout", function(d, index) {
                    toolTip.hide(d);
                    d3.select(this).attr("r", 15).style("fill", "blue").attr("opacity", ".5");

                    ;
                });

            return circlesGroup;
        }



        var xLinearScale = xScale(inputData, select_xaxis);
        var yLinearScale = yScale(inputData, select_yaxis);

        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(inputData)
            .enter()
            .append("circle")
            .classed("stateCircle", true)
            .attr("cx", d => xLinearScale(d[select_xaxis]))
            .attr("cy", d => yLinearScale(d[select_yaxis]))
            .attr("r", 15)
            .attr("fill", "blue")
            .attr("opacity", ".5");

        //append initial text
        var textGroup = chartGroup
            .selectAll(".stateText")
            .data(inputData)
            .enter()
            .append("text")
            .classed("stateText", true)
            .attr("x", d => xLinearScale(d[select_xaxis]))
            .attr("y", d => yLinearScale(d[select_yaxis]))
            .attr("dy", 3)
            .attr("font-size", "10px")
            .text(function(d) { return d.abbr });

        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");

        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

        var healthcareLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 0 - 20)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("axis-text", true)
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 0 - 40)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("axis-text", true)
            .classed("inactive", true)
            .text("Smokes (%)");

        var obesityLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 0 - 60)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("axis-text", true)
            .classed("inactive", true)
            .text("Obese (%)");


        var circlesGroup = updateToolTip(select_xaxis, select_yaxis, circlesGroup);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {

                var value = d3.select(this).attr("value");
                if (value !== select_xaxis) {
                    select_xaxis = value;
                    xLinearScale = xScale(inputData, select_xaxis);
                    xAxis = renderAxesX(xLinearScale, xAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, select_xaxis, yLinearScale, select_yaxis);
                    textGroup = renderText(textGroup, xLinearScale, select_xaxis, yLinearScale, select_yaxis);
                    circlesGroup = updateToolTip(select_xaxis, select_yaxis, circlesGroup);

                    if (select_xaxis === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (select_xaxis === "age") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });

        //y axis labels event listener
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value != select_yaxis) {
                    select_yaxis = value;
                    yLinearScale = yScale(inputData, select_yaxis);
                    yAxis = renderAxesY(yLinearScale, yAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, select_xaxis, yLinearScale, select_yaxis);
                    textGroup = renderText(textGroup, xLinearScale, select_xaxis, yLinearScale, select_yaxis)
                    circlesGroup = updateToolTip(select_xaxis, select_yaxis, circlesGroup);

                    //change classes to change bold text
                    if (select_yaxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (select_yaxis === "smokes") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    });
}


d3.select(window).on("resize", handleResize);
//initialize the chart
create_chart();