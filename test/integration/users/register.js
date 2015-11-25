import { expect } from "chai";
import axios      from "axios";
import User       from "../../../users/User";
import { createUser, removeUsers } from "../../support/helpers/users";

describe("Register", () => {
  describe("POST /user", () => {

    afterEach(removeUsers);

    it("Adds new user", done => {
      User.count({}, (err, count) => {
        expect(count).to.equal(0);

        axios.post("http://localhost:4001/user", {
          name: "FooBar",
          email: "foo@bar.com",
          password: "123456789",
        }).then(() => {

          User.count({}, (err, count) => {
            expect(count).to.equal(1);
            done();
          });
        });
      });
    });

    it("Returns user with token", done => {
      axios.post("http://localhost:4001/user", {
        name: "FooBar",
        email: "foo@bar.com",
        password: "123456789",
      }).then(response => {

        const user = response.data;

        expect(user).to.have.all.keys("id", "name", "email", "token", "archived", "confirmed");
        done();
      });
    });

    it("Doesn't add new user on invalid paylaod", done => {
      User.count({}, (err, count) => {
        expect(count).to.equal(0);

        axios.post("http://localhost:4001/user", {}).catch(response => {
          User.count({}, (err, count) => {
            expect(count).to.equal(0);
            done();
          });
        });
      });
    });

    it("Prevents creating two account with the same email", done => {
      createUser().then(user => {
        axios.post("http://localhost:4001/user", {
          name:     "FooBar",
          email:    user.email ,
          password: "123456789",
        }).catch(response => {
          expect(response.status).to.equal(409);
          expect(response.data.message).to.equal("Email has already been taken");
          done();
        });
      });
    });
  });
});
