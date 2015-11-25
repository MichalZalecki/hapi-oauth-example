import { expect }     from "chai";
import axios          from "axios";
import { createUser, removeUsers } from "../../support/helpers/users";

describe("Get user", () => {
  describe("GET /user", () => {

    let token;

    beforeEach(() => {
      return createUser().then(user => {
        token = user.token;
      });
    });

    afterEach(removeUsers);

    it("Return current user based on Authorization header", () => {
      return axios.get("http://localhost:4001/user", {
        headers: {
          "Authorization": `Token ${token}`,
        },
      }).then(response => {
        const user = response.data;

        expect(user).to.have.all.keys("id", "name", "email", "archived", "confirmed");
        expect(user).to.not.have.any.keys("token");
      });
    });

    it("Return error on invalid Authorization header", () => {
      return axios.get("http://localhost:4001/user", {
        headers: {
          "Authorization": `Token ${token}1nv@lid`,
        },
      }).catch(response => {
        expect(response.status).to.equal(404);
        expect(response.data.message).to.equal("Invalid token");
      });
    });
  });
});
