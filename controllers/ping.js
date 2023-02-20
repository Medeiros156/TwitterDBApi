import fetch from 'node-fetch';

export async function ping() {
  try {
    const res = await fetch(`https://ping-gd0d.onrender.com/ping/ping`, {
      headers: {},
      body: null,
      method: "GET",
    });
  } catch (error) {
    console.log(error.message);
  }
}

export const pingReceive = async (req, res) => {
  console.log("pingReceive");
  try {
    res.status(200).json({
      0: 0,
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
};
