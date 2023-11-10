import axios from "axios";
import { validateEmail } from "helper/functions";

export const klavTrack = async ($email, event, properties) => {
  if (validateEmail($email)) {
    const url = "https://a.klaviyo.com/api/track";
    await axios.post(url, {
      token: process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY,
      event,
      customer_properties: { $email },
      properties,
    });
    return;
  } else {
    return;
  }
};

export const klavIdentify = async ($email, properties) => {
  if (validateEmail($email)) {
    const url = "https://a.klaviyo.com/api/identify";
    await axios.post(url, {
      token: process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY,
      properties,
    });
    return;
  } else {
    return;
  }
};
