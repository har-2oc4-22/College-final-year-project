const axios = require('axios');

async function testApi() {
  try {
    const parseRes = await axios.post('http://localhost:5000/api/smart-cart/parse', {
      text: "add 2 apples and a milk"
    });

    console.log("Parse Success:", JSON.stringify(parseRes.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
}

testApi();
