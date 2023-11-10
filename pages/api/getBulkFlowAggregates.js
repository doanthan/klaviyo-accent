import axios from "axios";


//data.data.attributes
const requestResults = async (url, header, body, allResponseData) => {
    try {
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
        if (e.response.status === 429) {
            requestResults(url, header, body, allResponseData)
        } else { return null }
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

// [{label: Placed ORder(API), value: Placed Order (API), name: 'Placed Order', integration: 'API', metrics:[{value: 'ABC123', pk:pk_123123. accountName: aus, integration: api}]}] 
export default async function getMetrics(req, res) {
    const { from, to, cadence, tally, metricGroups, panelType } = req.body
    // {integration: zendesk, label: Opened Ticket (Zendesk), name: Opened Ticket, value: "Opened Ticket (Zendesk), integration:'Klaviyo", metrics:[{value, pk}]}
    let setTally = tally
    let results = []
    let dates = []
    let allFlowNames = []
    for (let metricGroup of metricGroups) {
        console.log(metricGroup.name)
        for (let metric of metricGroup.metrics) {
            let allResponseData = { labels: "", values: [] }
            let allFlowData = []
            console.log(metricGroup.name)
            //TODO BUG WITH KLAVIYO API
            // If integeration = Klaviyo, always set count.
            let by = panelType
            if (metric.integration === "Klaviyo") {
                by = "$flow"
                setTally = "count"
            }


            const url = `https://a.klaviyo.com/api/metric-aggregates/`
            const header = { headers: { Authorization: `Klaviyo-API-Key ${metric.pk}`, revision: process.env.NEXT_PUBLIC_KLAVIYO_API_VERSION } }
            const body = {
                data: {
                    type: "metric-aggregate", attributes: {
                        metric_id: metric.value, measurements: [setTally], filter: [`greater-or-equal(datetime,${from})`, `less-than(datetime,${to})`],
                        page_cursor: "",
                        interval: cadence,
                        page_size: 500,
                        by: [by],
                        return_fields: [],
                        timezone: "UTC"
                    }
                }

            }

            const flowNames = await getFlowNames("https://a.klaviyo.com/api/flows/", header, allFlowData, metricGroup)
            allFlowNames = [...allFlowNames, ...flowNames]
            console.log(flowNames.length)



            const values = await requestResults(url, header, body, allResponseData)

            if (values) {

                for (let record of values.values) {
                    //ignore blank dimensions- nobody wants to see that! (I think)
                    //console.log(record)
                    if (record.dimensions[0] != "") {
                        if (setTally === "sum_value") {
                            //work out conversion here
                            results.push({ conversion: metric.conversion, flowId: record.dimensions[0], values: record.measurements.sum_value.map(function (x) { return x * metric.conversion }), accountName: metric.accountName, pk: metric.pk, metricName: metricGroup.label })
                        }
                        if (setTally === "count") {
                            // console.log(record.measurements)
                            results.push({ conversion: metric.conversion, flowId: record.dimensions[0], values: record.measurements.count, accountName: metric.accountName, pk: metric.pk, metricName: metricGroup.label })
                        }
                        if (setTally === "unique") {
                            results.push({ conversion: metric.conversion, flowId: record.dimensions[0], values: record.measurements.unique, accountName: metric.accountName, pk: metric.pk, metricName: metricGroup.label })
                        }
                    }

                }


                dates = values.labels
            }
        }
    }


    //merge with flow names to get names
    let fixedResults = results.map(t1 => ({ ...t1, ...allFlowNames.find(t2 => t2.flowId === t1.flowId) }))
    let finalResults = fixedResults.map(result => { return { conversion: result.conversion, label: `(${result.accountName}) ${result.name}`, values: result.values, flowId: result.flowId, value: result.name, metricName: result.metricName } })



    const response = { dates, finalResults }


    return res.status(200).send(response);


}
