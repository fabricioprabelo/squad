import fs from "fs";
import path from "path";
import chai from "chai";
import { SERVER_HOST, SERVER_PORT } from "../configs/constants";

const expect = chai.expect;
const url = `http://${SERVER_HOST}:${SERVER_PORT}`;
const filepath = path.join(__dirname, "token.txt");

const getToken = () => {
  let token = null;
  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath);
    token = content.toString();
  }
  return token;
}

const deleteToken = () => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

export {expect, url, filepath, getToken, deleteToken}
