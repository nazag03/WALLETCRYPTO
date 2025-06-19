<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const props = defineProps({
  title: String,
  dataPoints: Array
})

const chartData = {
  labels: props.dataPoints.map((_, i) => `T${i + 1}`),
  datasets: [
    {
      label: props.title,
      data: props.dataPoints,
      borderColor: '#4bc0c0',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}
</script>

<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 250px;
  margin-bottom: 20px;
}
</style>
