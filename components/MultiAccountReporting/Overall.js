

import React, { useState, useEffect } from 'react'

import SelectionPanel from './SelectionPanel'
import ReportPanel from './GraphPanel'
import moment from 'moment'

function OverallTab({ metricsList }) {

    const [fromToDates, setFromToDates] = useState([moment().subtract(7, "days").utc().startOf("day").toDate(), moment().endOf("day").toDate()])
    const [tally, setTally] = useState("count")
    const [cadence, setCadence] = useState("day")
    const [oldMetrics, setOldMetrics] = useState([])
    const [metrics, setMetrics] = useState([])
    const [results, setResults] = useState([])
    const [labels, setLabels] = useState([])


    return (
        <>
            <SelectionPanel results={results} setResults={setResults} labels={labels} setLabels={setLabels} metricsList={metricsList} oldMetrics={oldMetrics} setOldMetrics={setOldMetrics} setMetrics={setMetrics} metrics={metrics} setFromToDates={setFromToDates} fromToDates={fromToDates} cadence={cadence} setCadence={setCadence} tally={tally} setTally={setTally} />
            <ReportPanel labels={labels} results={results} />
        </>
    )
}

export default OverallTab