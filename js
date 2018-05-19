var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

$("body").append("<div class='title'><h3>freeCodeCamp D3.js Heatmap Project</h3></div>")

$.ajax({
  dataType: "json",
  url: url,
  success: function(data){
    processData(data);
  }
});

function processData(data) {
  
  var json = data.monthlyVariance
  
  //chart margins and size
  var margin = {top: 20, right: 10, bottom: 90, left: 70};
  var height = 500 - margin.top - margin.bottom,
      width = 1340 - margin.left - margin.right;
  
  //set grid colors, y axis
  var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  function getYear(d) {
    var yr = d.year;
    var yrStr = yr+"-10-10T00:00:00";
    return new Date(Date.parse(yrStr));
  }
  
  //set x axes: Year
  var x = d3.scaleTime()
      .domain([d3.min(json, function(d){ return getYear(d); }), d3.max(json, function(d){ return getYear(d); })]).range([0, width]);
  
  var nYears = parseInt(json[json.length-1].year) - parseInt(json[0].year);
  
  //grid size and legend size
  var gridSize = Math.floor((width*12/ json.length)),
      gridHeight = Math.floor(height / 12),
      legendElementWidth = gridHeight,
      buckets = 10;

  //put svg
  var svg = d3.select("body").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  //month label, add y axis
  var monthLabels = svg.selectAll(".monthLabel")
          .data(months)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridHeight; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridHeight / 1.5 + ")")
            .attr("class",  "monthLabel mono axis axis-mth");
  
  //add x axis
  var xAxis = d3.axisBottom(x);
  svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + height +")")
       .call(xAxis);
  
  //axes labels
  svg.append("text")
     .attr("x", -margin.left + 15)
     .attr("y", -margin.top/2)
     .text("Month");
  
  svg.append("text")
     .attr("x", width - 40)
     .attr("y", height + margin.bottom/2 - 15)
     .text("Year");

  //create color scale
  var colorScale = d3.scaleQuantile()
               .domain([d3.min(json, function(d) {return d.variance}), d3.max(json, function(d) {return d.variance})])
               .range(colors);
  
  //add tooltip
  var div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);
  
  //Build heatmap
  svg.selectAll(".heat")
     .data(json).enter()
     .append("rect")
     .attr("x", function(d) { return x(getYear(d)); })
     .attr("y", function(d) { return (d.month - 1) * gridHeight; })
     .attr("rx", 1)
     .attr("ry", 1)
     .attr("class", "heat")
     .attr("width", gridSize+1)
     .attr("height", gridHeight)
     .style("fill", function(d) { return colorScale(d.variance); })
  
  //animation for tooltip
     .on("mouseover", function(d) {
    d3.select(this).style("fill", "red"); //color on hover
    div.transition().duration(200)
       .style("background", "steelblue")
       .style("padding", "5px")
       .style("width", "120px")
       .style("text-align", "left")
       .style("color", "black")
       .style("opacity", 0.8);
       div.html("Year: " + d.year + "<br/>" + "Month: " + months[d.month-1] + "<br/>" + "Temp: " + Math.round((data.baseTemperature + d.variance)*100)/100)
       .style("left", (d3.event.pageX) + 5 + "px")
       .style("top", (d3.event.pageY) - 28 + "px")
  })
    .on("mouseout", function(d) {
    d3.select(this).style("fill", colorScale(d.variance));
    div.transition().duration(200)
       .style("opacity", 0);  
      });
  
  //Build legend
  var legend = svg.selectAll(".legend")
            .data(colorScale.quantiles())
            .enter().append("g")
            .attr("class", "legend")
        
  legend.append("rect")
            .attr("class", "bordered")
            .attr("x", function (d, i) { return margin.left + 30 + legendElementWidth*2 * i; })
            .attr("y", height - 10 + margin.bottom / 2)
            .attr("width", legendElementWidth * 2)
            .attr("height", legendElementWidth / 2)
            .style("fill", function(d, i) { return colors[i]; })
  
  legend.append("text")
        .attr("class", "mono")
        .text( function(d) { return Math.floor((d + data.baseTemperature) * 10)/10; })
        .attr("x", function(d, i) { return margin.left + 30 + legendElementWidth*2 * i; })
        .attr("y", height + margin.bottom - 20)
  
  //Add legend title
  svg.append("text")
     .attr("x", 0)
     .attr("y", height + 3 + margin.bottom / 2)
     .text("Temperature")
  
}
