import {searchUserInfo,} from '../TwitterBotDb.js'
import {selectAll} from '../mongoDb.js'

export const getUser = async (req, res) => {
  try {
    let username = req.query.q;
    let data = await searchUserInfo(username);
    res.status(200).json({data});
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
};
export const getTweetsFromDb = async (req, res) => {
  try {
    let param = req.query.q;
    let data = await selectAll(param);
    res.status(200).json({data});
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
};
export const getRefFromDb = async (req, res) => {
  try {
    let data = await selectAll("References");
    res.status(200).json({data});
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
};
