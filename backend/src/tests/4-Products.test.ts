import request from "supertest";
import { expect, getToken, url } from "./variables";

let id = null;
let token = null;

describe("Products", () => {
  before(() => {
    token = getToken();
  });

  it("Should be able to create product", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         mutation createProduct($data: ProductInput!) {
          createProduct(data: $data) {
              id
              name
              description
              price
           }
         }
       `,
        variables: {
          data: {
            name: "Wallpaper",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut rutrum urna et mi pulvinar dapibus. Donec erat odio, auctor vitae sapien at, bibendum sollicitudin nulla.",
            price: 100.55,
          }
        }
      })
     .expect(200)
     .end((err, res) => {
       if (err) return done(err);
       const json = res.body.data.createProduct;

       expect(json).to.have.property('id');
       expect(json).to.have.property('name');
       expect(json).to.have.property('description');
       expect(json).to.have.property('price');
       expect(json.name).equal("Wallpaper");

       id = json.id;

       done();
     });
   });

  it("Should be able to get products", (done) => {
     request(url)
       .post("/graphql")
       .set({Authorization: `Bearer ${token}`})
       .send({
         query: `
          query products($page: Int, $perPage: Int, $sortBy: String, $sortDir: Int, $filterByName: String) {
            products(page: $page, perPage: $perPage, sortBy: $sortBy, sortDir: $sortDir, filterByName: $filterByName) {
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
                price
              }
            }
          }
        `,
         variables: {
           page: 1,
           perPage: 1,
           sortBy: "createdAt",
           sortDir: -1,
           filterByName: "Wallpaper"
         }
       })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const json = res.body.data.products;

        expect(json).to.have.property('list');
        expect(json["list"]).to.be.a('array');
        expect(json).to.have.nested.property('list[0]');
        expect(json).to.have.nested.property('list[0].id');
        expect(json).to.have.nested.property('list[0].name');
        expect(json).to.have.nested.property('list[0].description');
        expect(json).to.have.nested.property('list[0].price');
        expect(json.list[0].name).equal("Wallpaper");

        done();
      });
  });

  it("Should be able to get the first product from the latest test", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         query product($id: String!) {
           product(id: $id) {
              id
              name
              description
              price
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
       const json = res.body.data.product;

       expect(json).to.have.property('id');
       expect(json).to.have.property('name');
       expect(json).to.have.property('description');
       expect(json).to.have.property('price');
       expect(json.name).equal("Wallpaper");

       done();
     });
  });

  it("Should be able to update product", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         mutation updateProduct($id: String!, $data: ProductInput!) {
          updateProduct(id: $id, data: $data) {
              id
              name
              description
              price
           }
         }
       `,
        variables: {
          id,
          data: {
            name: "Cheese Cake",
            description: "Sed neque elit, vulputate nec turpis eu, mattis interdum dui. Mauris ullamcorper dui vitae dui hendrerit maximus. Duis laoreet leo eget orci egestas, at placerat metus condimentum.",
            price: 255.90,
          }
        }
      })
     .expect(200)
     .end((err, res) => {
       if (err) return done(err);
       const json = res.body.data.updateProduct;

       expect(json).to.have.property('id');
       expect(json).to.have.property('name');
       expect(json).to.have.property('description');
       expect(json).to.have.property('price');
       expect(json.name).equal("Cheese Cake");

       done();
     });
  });

  it("Should be able to update delete product", (done) => {
    request(url)
      .post("/graphql")
      .set({Authorization: `Bearer ${token}`})
      .send({
        query: `
         mutation deleteProduct($id: String!) {
          deleteProduct(id: $id) {
              id
              name
              description
              price
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
       const json = res.body.data.deleteProduct;

       expect(json).to.have.property('id');
       expect(json).to.have.property('name');
       expect(json).to.have.property('description');
       expect(json).to.have.property('price');
       expect(json.name).equal("Cheese Cake");

       done();
     });
   });
})
