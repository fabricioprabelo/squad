import { deleteToken } from "./variables";

describe("Delete token", () => {
  it("Should be able to delete", (done) => {
    deleteToken();
    done();
  });
})
