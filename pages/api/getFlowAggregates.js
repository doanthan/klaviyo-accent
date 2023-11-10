import axios from "axios";

//data.data.attributes
const requestResults = async (url, header, body, allResponseData) => {
    try {
        console.log("HERE!")
        const { data } = await axios.post(url, body, header)
        allResponseData.labels = data.data.attributes.dates
        allResponseData.values = [...allResponseData.values, ...data.data.attributes.data]
        //iterate through multiple linked pages
        if (!data.data.links.next) {
            return allResponseData
        }
        else {
            return requestResults(data.data.links.next, header, body, allResponseData)
        }
    } catch (e) {
        //keep retrying if 429 (rate limit)
        if (e.response?.status === 429) {
            requestResults(url, header, body, allResponseData)
        } else {
            console.log(e.message)
            return null
        }
    }
}

const getFlowNames = async (url, header, allFlowData) => {
    try {
        const { data } = await axios.get(url, header)
        const newFlowData = data.data.map(flow => { return { flowId: flow.id, name: flow.attributes.name } })


        allFlowData = [...allFlowData, ...newFlowData]


        //iterate through multiple linked pages
        if (!data.links.next) {
            return allFlowData
        }
        else {
            return getFlowNames(data.links.next, header, allFlowData)
        }
    } catch (e) {
        //keep retrying if 429 (rate limit)
        if (e.response?.status === 429) {
            await getFlowNames(url, header, allFlowData)
        } else {
            console.log(e.message)
            return null
        }
    }
}


export default async function getMetrics(req, res) {
    const { from, to, cadence, tally, metricGroup, panelType } = req.body
    // {integration: zendesk, label: Opened Ticket (Zendesk), name: Opened Ticket, value: "Opened Ticket (Zendesk), integration:'Klaviyo", metrics:[{value, pk}]}


    let results = []
    let dates = []
    let allFlowNames = []
    for (let metric of metricGroup.metrics) {
        let allResponseData = { labels: "", values: [] }
        let allFlowData = []

        //TODO BUG WITH KLAVIYO API
        let by = panelType
        if (metric.integration === "Klaviyo") {
            by = "$flow"
        }

        const url = `https://a.klaviyo.com/api/metric-aggregates/`
        const header = { headers: { Authorization: `Klaviyo-API-Key ${metric.pk}`, revision: process.env.NEXT_PUBLIC_KLAVIYO_API_VERSION } }
        const body = {
            data: {
                type: "metric-aggregate", attributes: {
                    metric_id: metric.value, measurements: [tally], filter: [`greater-or-equal(datetime,${from})`, `less-than(datetime,${to})`],
                    page_cursor: "",
                    interval: cadence,
                    page_size: 500,
                    by: [by],
                    return_fields: [],
                    timezone: "UTC"
                }
            }

        }
        if (panelType === "$attributed_flow") {
            const flowNames = await getFlowNames("https://a.klaviyo.com/api/flows/", header, allFlowData, metricGroup)
            allFlowNames = [...allFlowNames, ...flowNames]
        }


        const values = await requestResults(url, header, body, allResponseData)
        if (values) {
            for (let record of values.values) {
                //ignore blank dimensions- nobody wants to see that! (I think)
                //console.log(record)
                if (record.dimensions[0] != "") {
                    if (tally === "sum_value") {
                        results.push({ flowId: record.dimensions[0], values: record.measurements.sum_value, accountName: metric.accountName, pk: metric.pk, metricName: metricGroup.label, conversion: metric.conversion })
                    }
                    if (tally === "count") {
                        // console.log(record.measurements)
                        results.push({ flowId: record.dimensions[0], values: record.measurements.count, accountName: metric.accountName, pk: metric.pk, metricName: metricGroup.label, conversion: metric.conversion })

                    }
                    if (tally === "unique") {
                        results.push({ flowId: record.dimensions[0], values: record.measurements.unique, accountName: metric.accountName, pk: metric.pk, metricName: metricGroup.label, conversion: metric.conversion })
                    }
                }

            }
            dates = values.labels
        }
    }
    //merge with flow names to get names
    let fixedResults = results.map(t1 => ({ ...t1, ...allFlowNames.find(t2 => t2.flowId === t1.flowId) }))
    let finalResults = fixedResults.map(result => { return { label: `(${result.accountName}) ${result.name}`, values: result.values, flowId: result.flowId, value: result.name, metricName: result.metricName, conversion: result.conversion } })
    console.log(finalResults)
    // {
    //     label: '(us) [[KEEP]] Post-Purchase Bounce Back - After First Purchase',
    //         values: [
    //             0, 6, 9, 0,
    //             0, 3, 3, 0
    //         ],
    //      flowId: 'X6cTrS',
    //      value: '[[KEEP]] Post-Purchase Bounce Back - After First Purchase',
    //     metricName: 'Clicked Email (Klaviyo)'
    // }
    //console.log(finalResults)
    const response = { dates, finalResults }

    // let finalResults = []
    // const dateArray = newResults[0].values.dates






    // const response = { dateArray, newResults: finalResults }

    return res.status(200).send(response);


}
