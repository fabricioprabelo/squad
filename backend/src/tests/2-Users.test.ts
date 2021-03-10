import bcrypt from "bcrypt";
import request from "supertest";
import { expect, getToken, url } from "./variables";

let id = null;
let token = null;

describe("Users", () => {
  before(() => {
    token = getToken();
  });

  it("Should be able to create user", (done) => {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync("123456", salt);

    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         mutation createUser($data: UserInput!) {
          createUser(data: $data) {
              id
              email
           }
         }
       `,
        variables: {
          data: {
            name: "Fulano",
            surname: "Ciclano",
            email: "fulano.ciclano@gmail.com",
            password,
            isActivated: true,
            isSuperAdmin: false,
            roleIds: [],
            claims: [],
          }
        }
      })
     .expect(200)
     .end((err, res) => {
       if (err) return done(err);
       const json = res.body.data.createUser;

       expect(json).to.have.property('id');
       expect(json).to.have.property('email');
       expect(json.email).equal("fulano.ciclano@gmail.com");

       id = json.id;

       done();
     });
   });

  it("Should be able to get users", (done) => {
     request(url)
       .post("/graphql")
       .set({Authorization: `Bearer ${token}`})
       .send({
         query: `
          query users($page: Int, $perPage: Int, $sortBy: String, $sortDir: Int, $filterByEmail: String) {
            users(page: $page, perPage: $perPage, sortBy: $sortBy, sortDir: $sortDir, filterByEmail: $filterByEmail) {
              paging {
                total
                pages
                perPage
                currentPage
              }
              list {
                id
                email
              }
            }
          }
        `,
         variables: {
           page: 1,
           perPage: 1,
           sortBy: "createdAt",
           sortDir: -1,
           filterByEmail: "fulano.ciclano@gmail.com"
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
        expect(json).to.have.nested.property('list[0].email');
        expect(json.list[0].email).equal("fulano.ciclano@gmail.com");

        done();
      });
  });

  it("Should be able to get the first user from the latest test", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         query user($id: String!) {
           user(id: $id) {
              id
              email
           }
         }
       `,
        variables: {
          id
        }
      })
     .expect(200)
     .end((err, res) => {
       if (err) return done(err);
       const json = res.body.data.user;

       expect(json).to.have.property('id');
       expect(json).to.have.property('email');
       expect(json.email).equal("fulano.ciclano@gmail.com");

       done();
     });
  });

  it("Should be able to update user", (done) => {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync("654321", salt);

    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         mutation updateUser($id: String!, $data: UserInput!) {
          updateUser(id: $id, data: $data) {
              id
              email
           }
         }
       `,
        variables: {
          id,
          data: {
            name: "Beltrano",
            surname: "Ciclano",
            email: "bentrano.ciclano@gmail.com",
            password,
            isActivated: true,
            isSuperAdmin: false,
            roleIds: [],
            claims: [],
          }
        }
      })
     .expect(200)
     .end((err, res) => {
       if (err) return done(err);
       const json = res.body.data.updateUser;

       expect(json).to.have.property('id');
       expect(json).to.have.property('email');
       expect(json.email).equal("bentrano.ciclano@gmail.com");

       done();
     });
  });

  it("Should be able to update delete user", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         mutation deleteUser($id: String!) {
          deleteUser(id: $id) {
              id
              email
           }
         }
       `,
        variables: {
          id
        }
      })
     .expect(200)
     .end((err, res) => {
       if (err) return done(err);
       const json = res.body.data.deleteUser;

       expect(json).to.have.property('id');
       expect(json).to.have.property('email');
       expect(json.email).equal("bentrano.ciclano@gmail.com");

       done();
     });
   });
})
