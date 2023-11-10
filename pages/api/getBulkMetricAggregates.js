import axios from "axios";

//TODO: Make this iterate
const requestResults = async (url, header, body) => {
    try {
        const { data } = await axios.post(url, body, header)
        return data.data.attributes
    } catch (e) {
        console.log("ERROR")
        console.log(e.body.errors)
        //keep retrying if 429 (rate limit)
        if (e.response.status === 429) {
            requestResults(url, header, body)
        } else { return null }
    }
}


export default async function getMetrics(req, res) {
    const { from, to, cadence, tally, metrics } = req.body
    console.log(cadence)
    let newResults = []

    for (let metric of metrics) {
        const url = `https://a.klaviyo.com/api/metric-aggregates/`
        const header = { headers: { Authorization: `Klaviyo-API-Key ${metric.pk}`, revision: process.env.NEXT_PUBLIC_KLAVIYO_API_VERSION } }
        const body = {
            data: {
                type: "metric-aggregate", attributes: {
                    metric_id: metric.value, measurements: [tally], filter: [`greater-or-equal(datetime,${from})`, `less-than(datetime,${to})`],
                    page_cursor: "",
                    interval: cadence,
                    page_size: 500,
                    by: [],
                    return_fields: [],
                    timezone: "UTC"
                }
            }

        }
        const values = await requestResults(url, header, body)
        if (values) {
            newResults.push({ label: metric.label, values })
        }
    }
    //finesse the data

    let finalResults = []
    const dateArray = newResults[0].values.dates

    for (let result of newResults) {
        if (tally === "count") {
            console.log(result)
            finalResults.push({ label: result.label, values: result.values.data[0].measurements.count })
        }
        if (tally === "sum_value") {
            finalResults.push({ label: result.label, values: result.values.data[0].measurements.sum_value })
        }
        if (tally === "unique") {
            finalResults.push({ label: result.label, values: result.values.data[0].measurements.unique })
        }
    }
    const response = { dateArray, newResults: finalResults }

    console.log(response)

    return res.status(200).send(response);


}
