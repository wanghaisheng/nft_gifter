const axios = require("axios");
const FormData = require("form-data");

IPFS_BASE_URL = process.env.NEXT_PUBLIC_IPFS_BASE_URL;
IPFS_JWT = process.env.NEXT_PUBLIC_IPFS_JWT;

exports.pinJSON = async (data) => {
    const url = `${IPFS_BASE_URL}/pinning/pinJSONToIPFS`;
    const r = await axios
        .post(url, {
            pinataMetadata: {
                name: data.filename
            },
            pinataContent: data.data
        }, {
            headers: {
                Authorization: `Bearer ${IPFS_JWT}`
            }
        });
    return r.data.IpfsHash;
};

exports.pinFile = async (data) => {
    let formData = new FormData();
    formData.append("file", data.image);

    const metadata = JSON.stringify({
        name: data.name
    });
    formData.append("pinataMetadata", metadata);

    const url = `${IPFS_BASE_URL}/pinning/pinFileToIPFS`;
    const r = await axios
        .post(url, formData, {
            maxBodyLength: "Infinity", //this is needed to prevent axios from erroring out with large files
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                Authorization: `Bearer ${IPFS_JWT}`
            }
        });

    return r.data.IpfsHash;
};