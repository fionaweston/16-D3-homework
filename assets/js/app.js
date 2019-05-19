var width = 900;
var height = 400;

var margin = {
  top: 20,
  right: 0,
  bottom: 60,
  left: 220
};

var graphWidth = width - margin.left - margin.right;
var graphHeight = height - margin.top - margin.bottom;

// create an SVG element and append to the body
var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

// create group element
var graphGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

// import data and create chart for it
d3.csv("/assets/data/data.csv").then(function(stateData) {
  // convert strings to numbers for percentage fields
  stateData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.obesity = +data.obesity;
  });

  // create scale functions
  var xLinearScale = d3.scaleLinear().range([0, graphWidth]);
  var yLinearScale = d3.scaleLinear().range([graphHeight, 0]);

  // create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xMin; var xMax;
  var yMin; var yMax;
  
  xMin = d3.min(stateData, function(data) {
      return data.obesity;
  });
  
  xMax = d3.max(stateData, function(data) {
      return data.obesity;
  });
  
  yMin = d3.min(stateData, function(data) {
      return data.poverty;
  });
  
  yMax = d3.max(stateData, function(data) {
      return data.poverty;
  });
  
  // determine the range of the axes, pad a little to fit the data better
  xLinearScale.domain([xMin-1, xMax+2]);
  yLinearScale.domain([yMin-1, yMax+2]);
  // console.log(xMin + " " + xMax);
  // console.log(yMin + " " + yMax);

  // append axes to the graph
  graphGroup.append("g")
            .attr("transform", `translate(0, ${graphHeight})`)
            .call(bottomAxis);

  graphGroup.append("g")
            .call(leftAxis);

  // initialize tool tip
  var toolTip = d3.tip()
                  .attr("class", "d3-tip")
                  .offset([80, -60])
                  .html(function(data) {
                      return ("<div>" + data.state + "</div>" + "<div>poverty: " + data.poverty + "</div><div>obesity: " + data.obesity + "</div>");
                  });

  // create tooltip in the chart
  graphGroup.call(toolTip);

  // create circles
  var circlesGroup = graphGroup.selectAll("circle")
                               .data(stateData)
                               .enter()

  circlesGroup.append("circle")
              .attr("cx", function(data) {
                   return xLinearScale(data.obesity);
              })
              .attr("cy", function(data) {
                   return yLinearScale(data.poverty);
              })
              .attr("r", "12")
              .attr("fill", "lightblue")
              .attr("opacity", .4)
              // create event listeners to display and hide the tooltip
              .on("mouseover", function(data) {
                  toolTip.show(data,this);
              })
              .on("mouseout", function(data) {
                  toolTip.hide(data);
              });

  // add state abbreviations to the circle text
  circlesGroup.append("text")
              .text(function(data) {
                  return data.abbr
              })
              .style("font-size", "10")
              .attr("dx", function(data) {
                  return xLinearScale(data.obesity) - 7;
              })
              .attr("dy", function(data) {
                  return yLinearScale(data.poverty) + 2;
              })
              .on("mouseover", function(data) {
                  toolTip.show(data,this);
              })
              .on("mouseout", function(data) {
                  toolTip.hide(data);
              });

  // create axis labels
  graphGroup.append("text")
            .attr("transform", `translate(${graphWidth / 2}, ${graphHeight + margin.top + 30})`)
            .attr("class", "axisText")
            .text("Obesity (%)");

  graphGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 160)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("Poverty (%)");
});
