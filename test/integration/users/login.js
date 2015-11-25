import { expect }     from "chai";
import axios          from "axios";
import { createUser, removeUsers } from "../../support/helpers/users";

describe("Login", () => {
  describe("POST /session", () => {

    beforeEach(() => createUser());

    afterEach(removeUsers);

    it("Returns user with token on success", () => {
      return axios.post("http://localhost:4001/session", {
        email:    "foo@bar.com",
        password: "123456789",
      }).then(response => {
        const user = response.data;

        expect(user).to.have.all.keys("id", "name", "email", "token", "archived", "confirmed");
      });
    });

    it("Returns 403 error on invalid credentials", () => {
      return axios.post("http://localhost:4001/session", {
        email:    "foo@bar.com",
        password: "12345678",
      }).catch(response => {
        expect(response.status).to.equal(403);
        expect(response.data.message).to.equal("Invalid credentials");
      });
    });
  });
});
