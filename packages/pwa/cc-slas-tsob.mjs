// CLI to get SLAS "Trusted System on Behalf Of" Shopper JWT.
import fetch from 'node-fetch'
import {program} from 'commander'
import {URLSearchParams} from 'url'

const SHORTCODE = 'kv7kzm78'
const ORG_ID = 'f_ecom_zzrf_001'
const SITE_ID = 'RefArch'
const CLIENT_ID = '****'
const CLIENT_SECRET = '****'

const API_BASE = `https://${SHORTCODE}.api.commercecloud.salesforce.com/`

async function getTSOBShopperAccessToken(login_id) {
    const url = `${API_BASE}shopper/auth/v1/organization/${ORG_ID}/oauth2/trusted-system/token`
    const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`
    const authorization = 'Basic ' + Buffer.from(credentials).toString('base64')
    const headers = {authorization}
    const body = new URLSearchParams({
        hint: 'ts_ext_on_behalf_of',
        grant_type: 'client_credentials',
        login_id,
        idp_origin: 'ecom',
        channel_id: SITE_ID
    })
    const fetchOptions = {
        method: 'POST',
        headers,
        body
    }

    //console.log({url, fetchOptions})
    let response = await fetch(url, fetchOptions)
    // console.log(response.statusText)
    let data = await response.json()
    return data.access_token
}

program
    .command('get-token')
    .requiredOption('--email <shortcode>', 'Email of who to login as, `jboxall@salesforce.com`')
    .action(async ({email: login_id}) => {
        const access_token = await getTSOBShopperAccessToken(login_id)
        console.log(access_token)
    })

program.parse(process.argv)
