import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { fetchData } from '../services/dataService';

const TimeSeriesChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2023-01-01'));
  const [endDate, setEndDate] = useState(new Date('2023-01-31'));

  const updateData = async (newStartDate, newEndDate) => {
    const fetchedData = await fetchData(newStartDate, newEndDate);
    setData(fetchedData);
  };

  useEffect(() => {
    updateData(startDate, endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!data || data.length === 0) {
      console.warn('No data to render');
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .attr('class', 'x-axis');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .attr('class', 'y-axis');

    const validData = data.filter(d => d.date && d.value !== null && d.value !== undefined);

    svg.append('path')
      .datum(validData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
      );

    const zoom = d3.zoom()
      .scaleExtent([1, 5])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed);

    svg.call(zoom);

    function zoomed(event) {
      const transform = event.transform;
      const newXScale = transform.rescaleX(xScale);

      svg.selectAll('path')
        .attr('d', d3.line()
          .x(d => newXScale(d.date))
          .y(d => yScale(d.value))
        );

      svg.select('.x-axis').call(d3.axisBottom(newXScale));

      const [newStartDate, newEndDate] = newXScale.domain();
      if (newStartDate < startDate || newEndDate > endDate) {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        updateData(newStartDate, newEndDate);
      }
    }

  }, [data, startDate, endDate]);

  return (
    <div>
      <svg ref={svgRef} width={800} height={400}></svg>
    </div>
  );
};

export default TimeSeriesChart;
