import axios from "axios";

// DT: call out to Open Weather API using lat lon from the user's profile, then use the weather details to populate an event inside Klaviyo
export default async function klaviyoTrack(req, res) {
  const PRIVATE_KEY = req.query.privateKey;
  const metric = req.query.metric;
  let eventsList = [];
  console.log("Yep");

  // async function getMetrics(since = "", metric, PRIVATE_KEY) {
  //   const url = `https://a.klaviyo.com/api/v1/metric/${metric}/timeline?api_key=${PRIVATE_KEY}&since=${since}`;
  //   const { data } = await axios.get(url);
  //   data.data.map((event) => {
  //     eventsList.push({
  //       ...{
  //         "Person//Email": event.person.email,
  //         event_name: event.event_name,
  //         Timestamp: event.datetime,
  //       },
  //       ...event.event_properties,
  //     });
  //     console.log(data.next);
  //   });
  //   if (data.next !== null) {
  //     getMetrics(data.next, metric, PRIVATE_KEY);
  //   } else {
  //     console.log("done");
  //   }
  // }

  async function getMetrics(since = "", metric, PRIVATE_KEY) {
    let next = since;

    do {
      const url = `https://a.klaviyo.com/api/v1/metric/${metric}/timeline?api_key=${PRIVATE_KEY}&since=${next}&count=100`;
      console.log(next);
      const { data } = await axios.get(url);
      data.data.map((event) => {
        if (event.event_properties.value !== 0) {
          eventsList.push({
            ...{
              "Person//Email": event.person.email,
              event_name: event.event_name,
              Timestamp: event.datetime,
            },
            ...event.event_properties,
          });
        }
        next = data.next;
        console.log(data.next);
      });
    } while (next !== null);
  }

  await getMetrics("1651016406", metric, PRIVATE_KEY);
  return res.status(200).send(eventsList);
}
