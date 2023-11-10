
import React, { useState, useEffect } from 'react'

import moment from 'moment'
import { Spinner, Button } from 'reactstrap'
import SelectionPanelFlowsCamp from './SelectionPanelFlowsCamp'
import ReportPanel from './GraphPanel'
import FlowDataTable from './FlowDataTable'
import { DEFAULT_FLOW_HEADERS } from './data'
import axios from 'axios'

function FlowsTab({ groupedMetricsList }) {
    //join like metrics together
    const [fromToDates, setFromToDates] = useState([moment().subtract(7, "days").utc().startOf("day").toDate(), moment().endOf("day").toDate()])
    const [tally, setTally] = useState("count")
    const [cadence, setCadence] = useState("day")
    const [oldMetrics, setOldMetrics] = useState([])
    const [metrics, setMetrics] = useState([])
    const [results, setResults] = useState([])
    const [labels, setLabels] = useState([])
    const [selectedFlows, setSelectedFlows] = useState([])
    const [flowList, setFlowList] = useState([])

    const [loading, setLoading] = useState(false)
    const [columns, setColumns] = useState(DEFAULT_FLOW_HEADERS)
    const [reportResults, setReportResults] = useState([])

    useEffect(() => {
        //console.log(campaignResults)
    }, [reportResults])


    const loadReportMetrics = async () => {
        setReportResults([])
        setLoading(true)
        const getMetrics = metrics
        groupedMetricsList.map(groupedMetric => {
            if ((groupedMetric.name === 'Opened Email' || groupedMetric.name === 'Received Email' || groupedMetric.name === 'Clicked Email' || groupedMetric.name === 'Received SMS') && groupedMetric.integration === "Klaviyo") {
                getMetrics = [...getMetrics, groupedMetric]
            }
        })
        console.log(getMetrics)
        const from = moment(fromToDates[0]).format("YYYY-MM-DDTHH:mm:ss")
        const to = moment(fromToDates[1]).format("YYYY-MM-DDTHH:mm:ss")
        const body = {
            from,
            to,
            cadence,
            tally,
            metricGroups: getMetrics,
            panelType: "$attributed_flow"
        }
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}getBulkFlowAggregates`, body)


        //cleanse the data for the report
        let newArray = []

        data.finalResults.map(row => newArray.push({ flowId: row.flowId, label: row.label, [row.metricName]: row.values.reduce((partialSum, a) => partialSum + a, 0) }))
        // merge the downloaded results based on label name
        const result = newArray.reduce((acc, value) => {
            const fIndex = acc.findIndex(v => v.label === value.label);
            if (fIndex >= 0) {
                acc[fIndex] = {
                    ...acc[fIndex],
                    ...value
                }
            } else {
                acc.push(value);
            }
            return acc;
        }, []);
        console.log(result)

        let mergedResults = []
        await result.map(row => {
            if (row["Received Email (Klaviyo)"]) {
                mergedResults.push({ ...row, openPercent: row["Opened Email (Klaviyo)"] / row["Received Email (Klaviyo)"] * 100, clickPercent: row["Clicked Email (Klaviyo)"] / row["Received Email (Klaviyo)"] * 100 })
            } else {
                mergedResults.push(row)
            }

        })

        console.log(mergedResults)

        setReportResults(mergedResults)
        setLoading(false)


    }

    return (
        <>
            <SelectionPanelFlowsCamp setColumns={setColumns} columns={columns} groupedMetricsList={groupedMetricsList} flowList={flowList} setFlowList={setFlowList} results={results} setResults={setResults} labels={labels} setLabels={setLabels} oldMetrics={oldMetrics} setOldMetrics={setOldMetrics} setMetrics={setMetrics} metrics={metrics} setFromToDates={setFromToDates} fromToDates={fromToDates} cadence={cadence} setCadence={setCadence} tally={tally} setTally={setTally} panelType="$attributed_flow" selectedFlows={selectedFlows} setSelectedFlows={setSelectedFlows} />
            <ReportPanel labels={labels} results={flowList} />
            <div className='text-center'>
                <Button disabled={loading} onClick={loadReportMetrics} > {loading ? <Spinner>
                    Loading...
                </Spinner> : "Load Row Report"} </Button>
                <FlowDataTable reportResults={reportResults} columns={columns} />
            </div>
        </>
    )
}

export default FlowsTab