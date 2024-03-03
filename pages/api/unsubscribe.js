import axios from "axios";

export default async function getMetrics(req, res) {

    const { pk, email } = req.query

    const header = {
        headers: {
            Authorization: `Klaviyo-API-Key ${pk}`,
            revision: "2023-10-15"
        }
    }
    try {
        const { data } = await axios.get(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${email}")`, header)
        if (data.data.length > 0) {
            try {
                const { data } = await axios.get(`https://a.klaviyo.com/api/profiles?filter=equals(email,"${email}")`, header)
                console.log(data)
                if (data) {
                    const suppressInfo = {
                        "data": {
                            "type": "profile-suppression-bulk-create-job",
                            "attributes": {
                                "profiles": {
                                    "data": [
                                        {
                                            "type": "profile",
                                            "attributes": {
                                                "email": email
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                    const { data } = await axios.post(`https://a.klaviyo.com/api/profile-suppression-bulk-create-jobs/`, suppressInfo, header)
                    console.log("suppresed " + email)
                    console.log(data.status)
                    console.log("YEAH!!")
                    return res.status(200).send({ response: `✅ ${email} unsubscribed` });
                } else {
                    return res.status(200).send({ response: "Something went wrong" });
                }
            } catch (e) {
                return res.status(200).send({ response: e.message });
            }
        } else {
            console.log(data)
            return res.status(200).send({ response: "Profile not found" });

        }

    } catch (e) {
        console.log(e.message)
        return res.status(200).send({ response: e.message });
    }





}
