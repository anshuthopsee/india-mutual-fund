import { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { getSelectedFundName, getSelectedFundData, getSelectedFundStatus } from '../features/selected/selectedSlice';
import * as d3 from 'd3';
import { interpolatePath } from 'd3-interpolate-path';
import { sliderBottom } from 'd3-simple-slider';
import { parseDate, bisectDate, formatDate, getColor } from '../utils';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const showToast = (message, variant) => {
  enqueueSnackbar(message, { variant });
};

const Chart = () => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const chartParentRef = useRef(null);
  const chartAreaRef = useRef(null);
  const sliderRef = useRef(null);
  const tooltipRef = useRef(null);
  const sliderStartDateRef = useRef(null);
  const sliderEndDateRef = useRef(null);
  const fundName = useSelector(getSelectedFundName);
  const fundData = useSelector(getSelectedFundData);
  const fundStatus = useSelector(getSelectedFundStatus);
  const [navChange, setNavChange] = useState(0);
  const [dataPeriod, setDataPeriod] = useState("");

  const resizeObserver = new ResizeObserver((entries) => {
    const chartParent = entries[0].target;
    setWidth(chartParent.clientWidth);
    setHeight(chartParent.clientHeight);
  });

  const drawChart = (parentWidth, parentHeight, fundData) => {

    d3.select(chartAreaRef.current).selectAll("*").remove();
    d3.select(sliderRef.current).selectAll("*").remove();
  
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = parentWidth - margin.left - margin.right;
    const height = parentHeight - margin.top - margin.bottom;

    const svg = d3
      .select(chartAreaRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    let step = Math.ceil(fundData.length / 125);

    const data = [];

    for (let i = fundData.length - 1; i >= 0; i -= step) {
      const d = fundData[i];
      data.push({
        date: parseDate(d.date),
        nav: Number(d.nav),
      });

      if (i === 0) break;

      if (i - step < 0) step = i;
    };

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, (d) => d.date ))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, (d) => d.nav), d3.max(data, (d) => d.nav)])
      .range([height, 0]);

    const line = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.nav));

    svg.append('text')
      .attr('class', 'x-label')
      .attr('x', width / 2)
      .attr('font-size', "10px")
      .attr('fill', "#aeafb0")
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr("pointer-events", "none")
      .text('Date');

    svg.append('text')
      .attr('class', 'y-label')
      .attr('x', -height / 2)
      .attr('font-size', "10px")
      .attr('fill', "#aeafb0")
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr("pointer-events", "none")
      .text('NAV');

    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.round(width / 100));

    const yAxis = d3.axisLeft(yScale);

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .style('opacity', 0.5)
      .transition()
      .duration(250)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y-axis')
      .style('opacity', 0.5)
      .transition()
      .duration(250)
      .call(yAxis);

    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", getColor(data))
      .attr("stop-opacity", 1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", getColor(data))
      .attr("stop-opacity", 0);

    const area = d3
      .area()
      .x((d) => xScale(d.date))
      .y0(height)
      .y1((d) => yScale(d.nav));

    const circle = svg.append("circle")
      .attr("r", 0)
      .attr("fill", "none")
      .attr("opacity", 0)
      .attr("stroke", "none")
      .attr("pointer-events", "none");

    const crosshairHorizontal = svg.append("line")
      .attr("class", "crosshair")
      .attr("stroke", "#93a8fa")
      .attr("id", "crosshair-x")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "8, 8");

    const crosshairVertical = svg.append("line")
      .attr("class", "crosshair")
      .attr("stroke", "#93a8fa")
      .attr("id", "crosshair-y")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "8, 8");

    svg
      .data([data])
      .append('path')
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', "url(#area-gradient)")
      .style('opacity', 0)
      .transition()
      .duration(250)
      .style('opacity', 0.5);

    svg
      .data([data])
      .append('path')
      .attr('class', 'line')
      .attr('d', (d) => line(d))
      .attr('fill', 'none')
      .attr('stroke-width', 1.2)
      .style('stroke', getColor(data))
      .style('opacity', 0)
      .transition()
      .duration(250)
      .style('opacity', 1);

    const tooltip = d3.select(tooltipRef.current);

    svg.append("rect")
      .attr("class", "overlay")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .attr("position", "relative")
      .attr("cursor", "crosshair")
      .attr("z-index", 10)
      .attr("width", width)
      .attr("height", height)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout)
      .on("touchmove", mousemove)
      .on("touchend", mouseout);
    
    function mousemove(e) {
      if (data.length === 0) return;

      if (e.type === "touchmove") {
        const elementUnderTouch = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        if (!elementUnderTouch?.classList.contains("overlay")) return;
      };

      const [x, y] = d3.pointers(e)[0];
      const x0 = xScale.invert(x);
      const nearestPoint = bisectDate(data, x0);

      tooltip
        .text(`Date: ${formatDate(nearestPoint.date)} NAV: ${nearestPoint.nav}`);

      const tooltipWidth = tooltipRef.current.clientWidth;
      const xPos = xScale(nearestPoint.date);
      const yPos = yScale(nearestPoint.nav);
      const leftPos = xPos + 60 + tooltipWidth > parentWidth ? xPos + 42 - tooltipWidth : xPos + 58;
      const topPos = yPos - 30 < 0 ? yPos + 30 : yPos - 25;
    
      tooltip
        .style("left", `${leftPos}px`)
        .style("top", `${topPos}px`)
        .style("visibility", "visible");
    
      crosshairHorizontal
        .attr("x1", xPos)
        .attr("y1", 0)
        .attr("x2", xPos)
        .attr("y2", height);

      crosshairVertical
        .attr("x1", 0)
        .attr("y1", yPos)
        .attr("x2", width)
        .attr("y2", yPos);

      circle
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("r", 5).attr("opacity", 1)
        .attr("fill", getColor(data));
    };

    function mouseout() {
      tooltip.style("visibility", "hidden");
      crosshairHorizontal.attr("y1", 0).attr("y2", 0);
      crosshairVertical.attr("x1", 0).attr("x2", 0);
      circle.attr("r", 0).attr("opacity", 0);
    };

    const slider = sliderBottom()
      .min(d3.min(data, d => d.date.getTime()) || 0)
      .max(d3.max(data, d => d.date.getTime()) || 1) 
      .tickFormat(d3.timeFormat('%d-%m-%Y'))
      .ticks(0)
      .step(1)
      .marks(data.map(d => d.date.getTime()))
      .displayValue(false)
      .default([d3.min(data, d => d.date.getTime()) || 0, d3.max(data, d => d.date.getTime()) || 1])
      .fill('#2196f3')
      .height(50)
      .width(width);

    d3.select(sliderRef.current)
      .append('svg')
      .attr('width', parentWidth)
      .attr('margin', "auto, auto")
      .attr('height', 100)
      .append('g')
      .attr('transform', `translate(${40}, ${margin.top + 3})`)
      .call(slider);

    d3.select(".track")
      .attr("stroke-width", "11px")
      .attr("pointer-events", data.length > 0 ? "all" : "none");
    d3.select(".track-inset")
      .attr("stroke-width", "11px")
      .attr("pointer-events", data.length > 0 ? "all" : "none");
    d3.select(".track-overlay")
      .attr("stroke-width", "11px")
      .attr("pointer-events", data.length > 0 ? "all" : "none");
    d3.select(".handle")
      .attr("pointer-events", data.length > 0 ? "all" : "none");
    d3.select(".track-fill")
      .attr("stroke-width", "11px")
      .attr("pointer-events", data.length > 0 ? "all" : "none");

    slider.on('onchange', (val) => {
      sliderStartDateRef.current.textContent = formatDate(val[0]);
      sliderEndDateRef.current.textContent = formatDate(val[1]);
    });

    slider.on('end', (val) => {
      const filteredData = data.filter(d => d.date >= val[0] && d.date <= val[1]);

      if (filteredData.length < 2) {
        showToast("Selected date range is too short.", "error");
        return drawChart(parentWidth, parentHeight, fundData);
      };

      xScale.domain([filteredData[0].date.getTime(), filteredData[filteredData.length - 1].date.getTime()]);
      yScale.domain([d3.min(filteredData, d => d.nav), d3.max(filteredData, d => d.nav)]);

      setNavChange(filteredData.length > 0 ? (
        (
          (filteredData[filteredData.length - 1].nav - filteredData[0].nav) /
          filteredData[0].nav
        ) * 100
      ) || 0 : 0);

      setDataPeriod(
        `${formatDate(filteredData[0].date)} to ${formatDate(filteredData[filteredData.length - 1].date)}`
      );

      svg.select(".line")
        .transition()
        .duration(500)
        .attr('d', line(filteredData))
        .attrTween('d', function() {
          const previous = d3.select(this).attr('d');
          const current = line(filteredData);
          return interpolatePath(previous, current);
        })
        .style('stroke', getColor(filteredData));

      gradient.select("stop:nth-child(1)")
        .transition()
        .duration(500)
        .attr("stop-color", getColor(filteredData));
    
      gradient.select("stop:nth-child(2)")
        .transition()
        .duration(500)
        .attr("stop-color", getColor(filteredData)); 

      svg.select(".area")
        .transition()
        .duration(500)
        .attrTween('d', function() {
          const previous = d3.select(this).attr('d');
          const current = area(filteredData);
          return interpolatePath(previous, current);
        })
        .style('fill', "url(#area-gradient)")
        .style('opacity', 0.5);
  
      svg.select(".x-axis")
        .transition()
        .duration(0)
        .call(xAxis);
  
      svg.select(".y-axis")
        .transition()
        .duration(0)
        .call(yAxis);
    });

    const sliderValues = slider.value();
    const sliderStartValue = sliderValues[0];
    const sliderEndValue = sliderValues[sliderValues.length - 1];

    if (sliderStartValue !== 0 && sliderEndValue !== 1) {
      sliderStartDateRef.current.textContent = formatDate(sliderStartValue);
      sliderEndDateRef.current.textContent = formatDate(sliderEndValue);
    };
  };

  useEffect(() => {
    if (fundData.length > 0) {
      setNavChange(
        (
          (Number(fundData[0].nav) - Number(fundData[fundData.length - 1].nav)) / 
          Number(fundData[fundData.length - 1].nav)
        ) * 100
      );

      setDataPeriod(`${formatDate(fundData[fundData.length - 1].date)} to ${formatDate(fundData[0].date)}`);
    };
  }, [fundData]);

  useEffect(() => {
    resizeObserver.observe(chartParentRef.current);
    drawChart(width, height, fundData);
    return () => resizeObserver.disconnect();
  }, [width, height, fundData,]);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", flexDirection: "column" }}>
      <div ref={chartParentRef} style={{ display: 'flex', flexGrow: 1, minHeight: 350, width: '100%', position: "relative" }}>
        <div style={{ position: "absolute", height: "100%", 
          width: "100%", display: "flex", justifyContent: "center", 
          alignItems: "center", }}>
          {(fundStatus === "loading" || fundStatus === "error") && <CircularProgress />}
        </div>
        <div ref={chartAreaRef} style={{ display: 'flex', position: "relative" }}/>
        <Box ref={tooltipRef} sx={{ visibility: "hidden", position: "absolute", 
          top: 0, left: 0, width: "110px", height: "auto", zIndex: 2, pointerEvents: "none", 
          backgroundColor: "primary.main", color: "text.tooltip", fontSize: "12px", pl: "3px", wordWrap: "break-word" }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", position: "absolute", 
          top: 16, left: 55, maxWidth: "330px", height: "auto", zIndex: 0, pointerEvents: "none", 
          color: "text.secondary", opacity: 0.7, fontSize: "12px", pl: "3px", wordWrap: "break-word" }}
        >
          {fundName && fundData.length > 0 && <Typography variant="body2" fontSize={11} >{`Fund name: ${fundName}`}</Typography>}
          {fundData.length > 0 && <Typography variant="body2" fontSize={11}>{`Fund NAV change: ${navChange.toFixed(2)}%`}</Typography>}
          {fundData.length > 0 && <Typography variant="body2" fontSize={11}>{`Time period: ${dataPeriod}`}</Typography>}
        </Box>
      </div>
      <div ref={sliderRef} style={{ display: 'flex', height: "50px" }}/>
      <div style={{ display: 'flex', height: "40px", width: "100%", 
        justifyContent: "space-between", alignItems: "center" }}>
        <Typography ref={sliderStartDateRef} variant="body2" 
          fontSize={12} sx={{ color: "text.secondary", opacity: 0.7, pl: "10px" }}
        />
        <Typography ref={sliderEndDateRef} variant="body2" 
          fontSize={12} sx={{ color: "text.secondary", opacity: 0.7, pr: "10px" }}
        />
      </div>
    </div>
  );
};

export default Chart;