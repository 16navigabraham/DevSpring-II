// lib/pinata.js
export const uploadMetadataToIPFS = async (metadata) => {
  const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
  const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
    body: JSON.stringify(metadata),
  })

  const data = await res.json()
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
}
