import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface BaseChartProps {
  option: EChartsOption;
  height?: string;
}

export default function BaseChart({ option, height = '250px' }: BaseChartProps) {
  // Deep merge default styling for axis, grid, tooltips
  const defaultOption: EChartsOption = {
    grid: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 40,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--surface)',
      borderColor: 'var(--border)',
      textStyle: { color: 'var(--text)' }
    },
    xAxis: {
      type: 'category',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'var(--muted)' },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'var(--muted)' },
      splitLine: {
        lineStyle: { color: 'var(--border)', type: 'solid' }
      }
    }
  };

  const mergedOption = {
    ...defaultOption,
    ...option,
    grid: { ...defaultOption.grid, ...(option.grid as any) },
    xAxis: { ...defaultOption.xAxis, ...(option.xAxis as any) },
    yAxis: { ...defaultOption.yAxis, ...(option.yAxis as any) },
    tooltip: { ...defaultOption.tooltip, ...(option.tooltip as any) }
  };

  return (
    <ReactECharts
      option={mergedOption}
      style={{ height, width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}
