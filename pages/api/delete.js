import axios from "axios";

export default async function getMetrics(req, res) {

    const { pk, email } = req.query
    console.log(email)

    const header = {
        headers: {
            Authorization: `Klaviyo-API-Key ${pk}`,
            revision: "2023-10-15"
        }
    }

    try {
        const { data } = await axios.get(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${email}")`, header)
        if (data) {
            const url = "https://a.klaviyo.com/api/data-privacy-deletion-jobs/"
            const deleteInfo = {
                data: {
                    type: 'data-privacy-deletion-job',
                    attributes: {
                        profile: {
                            data: {
                                type: 'profile',
                                attributes: { email }
                            }
                        }
                    }
                }
            }
            await axios.post(url, deleteInfo, header)
            console.log("suppresed " + email)

            return res.status(200).send({ response: "deleted" });
        } else {
            return res.status(200).send({ response: "notFound" });
        }
    }

    catch (e) {
        console.log(e.message)
    }



}
