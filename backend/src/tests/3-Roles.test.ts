import request from "supertest";
import { expect, getToken, url } from "./variables";

let id = null;
let token = null;

describe("Roles", () => {
  before(() => {
    token = getToken();
  });

  it("Should be able to create role", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         mutation createRole($data: RoleInput!) {
          createRole(data: $data) {
              id
              name
              description
           }
         }
       `,
        variables: {
          data: {
            name: "Test",
            description: "Test of role",
            claims: [],
          }
        }
      })
     .expect(200)
     .end((err, res) => {
       if (err) return done(err);
       const json = res.body.data.createRole;

       expect(json).to.have.property('id');
       expect(json).to.have.property('name');
       expect(json).to.have.property('description');
       expect(json.name).equal("test");

       id = json.id;

       done();
     });
   });

  it("Should be able to get roles", (done) => {
     request(url)
       .post("/graphql")
       .set({Authorization: `Bearer ${token}`})
       .send({
         query: `
          query roles($page: Int, $perPage: Int, $sortBy: String, $sortDir: Int, $filterByName: String) {
            roles(page: $page, perPage: $perPage, sortBy: $sortBy, sortDir: $sortDir, filterByName: $filterByName) {
              paging {
                total
                pages
                perPage
                currentPage
              }
              list {
                id
                name
                description
              }
            }
          }
        `,
         variables: {
           page: 1,
           perPage: 1,
           sortBy: "createdAt",
           sortDir: -1,
           filterByName: "test"
         }
       })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const json = res.body.data.roles;

        expect(json).to.have.property('list');
        expect(json["list"]).to.be.a('array');
        expect(json).to.have.nested.property('list[0]');
        expect(json).to.have.nested.property('list[0].id');
        expect(json).to.have.nested.property('list[0].name');
        expect(json).to.have.nested.property('list[0].description');
        expect(json.list[0].name).equal("test");

        done();
      });
  });

  it("Should be able to get the first role from the latest test", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         query role($id: String!) {
           role(id: $id) {
              id
              name
              description
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
       const json = res.body.data.role;

       expect(json).to.have.property('id');
       expect(json).to.have.property('name');
       expect(json).to.have.property('description');
       expect(json.name).equal("test");

       done();
     });
  });

  it("Should be able to update role", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         mutation updateRole($id: String!, $data: RoleInput!) {
          updateRole(id: $id, data: $data) {
              id
              name
              description
           }
         }
       `,
        variables: {
          id,
          data: {
            name: "Test 1",
            description: "Test of role 1",
            claims: [],
          }
        }
      })
     .expect(200)
     .end((err, res) => {
       if (err) return done(err);
       const json = res.body.data.updateRole;

       expect(json).to.have.property('id');
       expect(json).to.have.property('name');
       expect(json).to.have.property('description');
       expect(json.name).equal("test-1");

       done();
     });
  });

  it("Should be able to update delete role", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         mutation deleteRole($id: String!) {
          deleteRole(id: $id) {
              id
              name
              description
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
       const json = res.body.data.deleteRole;

       expect(json).to.have.property('id');
       expect(json).to.have.property('name');
       expect(json).to.have.property('description');
       expect(json.name).equal("test-1");

       done();
     });
   });
})
