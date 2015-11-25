import { expect }     from "chai";
import axios          from "axios";
import crypto         from "crypto";
import User           from "../../../users/User";
import { createUser, removeUsers } from "../../support/helpers/users";

describe("Confirm email", () => {
  describe("GET /user/confirm/{confirmToken}", () => {

    let _id,
        confirmToken;

    beforeEach(() => {
      return createUser().then(user => {
        _id          = user._id;
        confirmToken = user.confirmToken;
      });
    });

    afterEach(removeUsers);

    it("Confirms user email", done => {
      axios.get(`http://localhost:4001/user/confirm/${confirmToken}`)
        .then(response => {
          expect(response.data).to.equal("Email has been confirmed");

          User.findById(_id, (err, user) => {
            expect(user.confirmToken).to.be.null;
            expect(user.confirmed).to.be.true;
            done();
          });
        });
    });

    it("Returns error on invalid token", done => {
      axios.get(`http://localhost:4001/user/confirm/${crypto.randomBytes(10).toString("hex")}`)
        .catch(response => {
          expect(response.status).to.equal(404);
          expect(response.data.message).to.equal("Invalid confirmation token or email has already been confirmed");
          done();
        });
    });

    it("Returns error on already confirmed user", done => {
      axios.get(`http://localhost:4001/user/confirm/${confirmToken}`)
        .then(response => {
          expect(response.data).to.equal("Email has been confirmed");

          axios.get(`http://localhost:4001/user/confirm/${crypto.randomBytes(10).toString("hex")}`)
            .catch(response => {
              expect(response.status).to.equal(404);
              expect(response.data.message).to.equal("Invalid confirmation token or email has already been confirmed");
              done();
            });
        });

    });
  });
});
