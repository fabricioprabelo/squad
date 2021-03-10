import fs from "fs";
import path from "path";
import chai from "chai";
import request from "supertest";
import { SERVER_HOST, SERVER_PORT } from "../configs/constants";

let token = null;
const expect = chai.expect;
const url = `http://${SERVER_HOST}:${SERVER_PORT}`;
const filepath = path.join(__dirname, "token.txt");

describe("Users", () => {
  before(() => {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath);
      token = content.toString();
    }
  });

  it("Should be able to get users", (done) => {
     request(url)
       .post("/graphql")
       .set({Authorization: `Bearer ${token}`})
       .send({
         query: `
          query users ($page: Int, $perPage: Int, $sortBy: String, $sortDir: Int) {
            users(page: $page, perPage: $perPage, sortBy: $sortBy, sortDir: $sortDir) {
              paging {
                total
                pages
                perPage
                currentPage
              }
              list {
                id
                name
                surname
                email
              }
            }
          }
        `,
         variables: {
           page: 1,
           perPage: 1,
           sortBy: "createdAt",
           sortDir: -1
         }
       })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const json = res.body.data.users;

        expect(json).to.have.property('list');
        expect(json["list"]).to.be.a('array');
        expect(json).to.have.nested.property('list[0]');
        expect(json).to.have.nested.property('list[0].id');
        expect(json).to.have.nested.property('list[0].name');
        expect(json).to.have.nested.property('list[0].surname');
        expect(json).to.have.nested.property('list[0].email');
        done();
      });
    });
})
