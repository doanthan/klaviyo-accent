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
        const { data } = await axios.get(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${encodeURIComponent(email)}")`, header)
        if (data.data.length > 0) {
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
            const result = await axios.post(url, deleteInfo, header)
            console.log("removed " + email)
            console.log(result.data)

            return res.status(200).send({ response: `✅ Removed ${email}` });
        } else {
            return res.status(200).send({ response: `${email} Not Found` });
        }
    }

    catch (e) {
        console.log(e.message)
        return res.status(200).send({ response: e.message });
    }



}
