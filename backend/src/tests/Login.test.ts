import fs from "fs";
import path from "path";
import chai from "chai";
import request from "supertest";
import { SERVER_HOST, SERVER_PORT } from "../configs/constants";

const expect = chai.expect;
const url = `http://${SERVER_HOST}:${SERVER_PORT}`;
const filepath = path.join(__dirname, "token.txt");

describe("Login", () => {
  it("Should be able to login", (done) => {
     request(url)
      .post("/graphql")
      .send({
        query: `
          query login ($email: String!, $password: String!, $remember: Boolean){
            login (email: $email, password: $password, remember: $remember) {
              token
            }
          }
        `,
        variables: {
          email: "contato@fabricioprabelo.com.br",
          password: "123456",
          remember: false
        }
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.login).to.have.property('token');
        fs.writeFileSync(filepath, res.body.data.login.token, { flag: 'w+' });
        done();
      });
    });
})
