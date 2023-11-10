import axios from "axios";

// DT: call out to Open Weather API using lat lon from the user's profile, then use the weather details to populate an event inside Klaviyo
export default async function getList(req, res) {
    const PRIVATE_KEY = req.query.privateKey;
    let listArray = []
    let counter = 0

    const headers = { headers: { revision: "2023-10-15", Authorization: `Klaviyo-API-Key ${PRIVATE_KEY}` } }
    await getListPaginated(`https://a.klaviyo.com/api/lists/`)


    // console.log(listArray.length)
    console.log(listArray.length)


    async function getListPaginated(url) {
        const { data } = await axios.get(url, headers);
        listArray = [...listArray, ...data.data]
        counter += 1
        console.log(counter)
        console.log(data.links.next)
        if (data.links.next) {
            await getListPaginated(data.links.next)
        }
    }
    console.log(listArray)
    const options = [];

    await listArray.map((list) => {
        options.push({ value: list.id, label: list.attributes.name });
    });
    console.log(options)
    return res.status(200).send(options);
}
