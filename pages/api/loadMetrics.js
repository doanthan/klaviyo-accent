import axios from "axios";

export default async function getMetrics(req, res) {

  const pkArray = req.body

  let allMetrics = []
  for (let account of pkArray) {
    try {
      const header = { headers: { Authorization: `Klaviyo-API-Key ${account.value}`, revision: process.env.NEXT_PUBLIC_KLAVIYO_API_VERSION } }
      const { data } = await axios.get("https://a.klaviyo.com/api/metrics/", header)
      const acctMetrics = data.data
      acctMetrics.map(metric => {
        allMetrics.push({ value: metric.id, label: `[${account.name}] ${metric.attributes.name} (${metric.attributes.integration.name})`, name: metric.attributes.name, account: account.name, integration: metric.attributes.integration.name, pk: account.value, conversion: account.conversion });
      })

    } catch (e) {
      console.log(e.message)
    }


  }



  return res.status(200).send(allMetrics);
}
