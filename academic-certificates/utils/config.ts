import { env } from "@/config/env/env.server"
import { env as envClient } from "@/config/env/env.client"
import { PinataSDK } from "pinata"

export const pinata = new PinataSDK({
    pinataJwt: `${env.PINATA_JWT}`,
    pinataGateway: `${envClient.GATEWAY_PINATA_URL}`,
})