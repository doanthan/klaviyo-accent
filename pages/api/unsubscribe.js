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
            await axios.post(`https://a.klaviyo.com/api/profile-suppression-bulk-create-jobs/`, suppressInfo, header)
            console.log("suppresed " + email)
        }
    } catch (e) {
        console.log(e.message)
    }



    return res.status(200).send("SUCCESS");
}
