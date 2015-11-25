import { expect } from "chai";
import getToken   from "../../../auth/getToken";

describe("getToken", () => {
  it("Returns token based on authorization header", () => {
    const headers = {
      "authorization": "Token abc123456789"
    };
    expect(getToken(headers)).to.equal("abc123456789");
  });

  it("Returns null when authorization header not present", () => {
    const headers = {};
    expect(getToken(headers)).to.be.null;
  });

  it("Returns null when authorization header is invalid", () => {
    const headers = {
      "authorization": "Tokenabc123456789"
    };
    expect(getToken(headers)).to.be.null;
  });
});
