import React from 'react'

import { COLOURS } from './data'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';



function ReportPanel({ labels, results }) {

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );




    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Chart',
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        }
    };
    const resultArray = results ? results?.map((result, index) => ({
        label: result.label, data: result.values, borderColor: COLOURS[index].borderColor,
        backgroundColor: COLOURS[index].backgroundColor,
    })) : []


    const data = {
        labels,
        datasets: resultArray && resultArray
    };

    return (
        <Bar options={options} data={data} />
    )
}

export default ReportPanel