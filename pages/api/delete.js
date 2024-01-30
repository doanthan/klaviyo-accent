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

    } catch (e) {
        console.log(e.message)
    }



    return res.status(200).send("SUCCESS");
}
