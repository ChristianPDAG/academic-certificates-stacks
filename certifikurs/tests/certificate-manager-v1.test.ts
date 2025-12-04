
import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const school = accounts.get("wallet_1")!;
const student = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("certificate-manager-v1 contract", () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');

    // Setup: Authorize manager as writer in certificate-data
    simnet.callPublicFn(
      "certificate-data",
      "authorize-writer",
      [Cl.contractPrincipal(deployer, "certificate-manager-v1")],
      deployer
    );
  });

  describe("school management", () => {
    it("allows super-admin to add a school", () => {
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [
          Cl.principal(school),
          Cl.stringAscii("Test University"),
          Cl.stringAscii("https://test-uni.com/metadata.json")
        ],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify school info
      const schoolInfo = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "get-school-info",
        [Cl.principal(school)],
        deployer
      );
      expect(schoolInfo.result).toBeSome(
        Cl.tuple({
          name: Cl.stringAscii("Test University"),
          active: Cl.bool(true),
          verified: Cl.bool(false),
          'registration-height': Cl.uint(simnet.blockHeight),
          'metadata-url': Cl.stringAscii("https://test-uni.com/metadata.json")
        })
      );
    });

    it("fails when non-admin tries to add school", () => {
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [
          Cl.principal(wallet3),
          Cl.stringAscii("Unauthorized School"),
          Cl.stringAscii("https://test.com")
        ],
        school
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it("fails to add duplicate school", () => {
      // Add school first time
      simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [
          Cl.principal(school),
          Cl.stringAscii("Test University"),
          Cl.stringAscii("https://test-uni.com/metadata.json")
        ],
        deployer
      );

      // Try to add again
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [
          Cl.principal(school),
          Cl.stringAscii("Duplicate School"),
          Cl.stringAscii("https://dup.com")
        ],
        deployer
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR_SCHOOL_ALREADY_EXISTS
    });

    it("allows super-admin to deactivate school", () => {
      // First add school
      simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [Cl.principal(school), Cl.stringAscii("Test"), Cl.stringAscii("https://test.com")],
        deployer
      );

      // Deactivate
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "deactivate-school",
        [Cl.principal(school)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("allows super-admin to verify school", () => {
      // Add school
      simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [Cl.principal(school), Cl.stringAscii("Test"), Cl.stringAscii("https://test.com")],
        deployer
      );

      // Verify
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "verify-school",
        [Cl.principal(school)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("credits management", () => {
    beforeEach(() => {
      // Add school
      simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [Cl.principal(school), Cl.stringAscii("Test University"), Cl.stringAscii("https://test.com")],
        deployer
      );
    });

    it("allows super-admin to fund school with credits", () => {
      const credits = 100;
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "admin-fund-school",
        [Cl.principal(school), Cl.uint(credits)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify credits
      const schoolCredits = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "get-school-credits",
        [Cl.principal(school)],
        deployer
      );
      expect(schoolCredits.result).toBeUint(credits);
    });

    it("fails to fund with zero credits", () => {
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "admin-fund-school",
        [Cl.principal(school), Cl.uint(0)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(107)); // ERR_INVALID_AMOUNT
    });

    it("fails to fund non-existent school", () => {
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "admin-fund-school",
        [Cl.principal(wallet3), Cl.uint(100)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(105)); // ERR_SCHOOL_NOT_FOUND
    });

    it("allows super-admin to update stx-per-credit", () => {
      const newAmount = 3000;
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "set-stx-per-credit",
        [Cl.uint(newAmount)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify update
      const stxPerCredit = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "get-stx-per-credit",
        [],
        deployer
      );
      expect(stxPerCredit.result).toBeUint(newAmount);
    });
  });

  describe("certificate issuance", () => {
    beforeEach(() => {
      // Setup: Add school and fund it
      simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [Cl.principal(school), Cl.stringAscii("Test University"), Cl.stringAscii("https://test.com")],
        deployer
      );
      simnet.callPublicFn(
        "certificate-manager-v1",
        "admin-fund-school",
        [Cl.principal(school), Cl.uint(10)],
        deployer
      );
    });

    it("allows authorized school to issue certificate", () => {
      const dataHash = new Uint8Array(32).fill(1);

      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "issue-certificate",
        [
          Cl.principal(student),
          Cl.some(Cl.stringAscii("A+")),
          Cl.uint(1701648000),
          Cl.none(),
          Cl.stringAscii("https://ipfs.io/ipfs/QmCert123"),
          Cl.buffer(dataHash)
        ],
        school
      );
      expect(result).toBeOk(Cl.uint(1));

      // Verify certificate exists
      const cert = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "get-certificate",
        [Cl.uint(1)],
        deployer
      );
      expect(cert.result).toBeSome(
        Cl.tuple({
          'school-id': Cl.principal(school),
          'student-wallet': Cl.principal(student),
          grade: Cl.some(Cl.stringAscii("A+")),
          'issue-height': Cl.uint(simnet.blockHeight),
          'graduation-date': Cl.uint(1701648000),
          'expiration-height': Cl.none(),
          'metadata-url': Cl.stringAscii("https://ipfs.io/ipfs/QmCert123"),
          'data-hash': Cl.buffer(dataHash),
          revoked: Cl.bool(false)
        })
      );

      // Verify credits were deducted
      const credits = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "get-school-credits",
        [Cl.principal(school)],
        deployer
      );
      expect(credits.result).toBeUint(9);
    });

    it("fails when school has insufficient credits", () => {
      // Deduct all credits first
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          "certificate-manager-v1",
          "issue-certificate",
          [
            Cl.principal(student),
            Cl.some(Cl.stringAscii("A")),
            Cl.uint(1701648000),
            Cl.none(),
            Cl.stringAscii("https://test.com"),
            Cl.buffer(new Uint8Array(32).fill(1))
          ],
          school
        );
      }

      // Try to issue without credits
      const dataHash = new Uint8Array(32).fill(1);
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "issue-certificate",
        [
          Cl.principal(student),
          Cl.some(Cl.stringAscii("A+")),
          Cl.uint(1701648000),
          Cl.none(),
          Cl.stringAscii("https://ipfs.io/ipfs/QmCert"),
          Cl.buffer(dataHash)
        ],
        school
      );
      expect(result).toBeErr(Cl.uint(106)); // ERR_INSUFFICIENT_CREDITS
    });

    it("fails when unauthorized tries to issue certificate", () => {
      const dataHash = new Uint8Array(32).fill(1);
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "issue-certificate",
        [
          Cl.principal(student),
          Cl.some(Cl.stringAscii("A+")),
          Cl.uint(1701648000),
          Cl.none(),
          Cl.stringAscii("https://test.com"),
          Cl.buffer(dataHash)
        ],
        wallet3
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it("fails when school is deactivated", () => {
      // Deactivate school
      simnet.callPublicFn(
        "certificate-manager-v1",
        "deactivate-school",
        [Cl.principal(school)],
        deployer
      );

      const dataHash = new Uint8Array(32).fill(1);
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "issue-certificate",
        [
          Cl.principal(student),
          Cl.some(Cl.stringAscii("A+")),
          Cl.uint(1701648000),
          Cl.none(),
          Cl.stringAscii("https://test.com"),
          Cl.buffer(dataHash)
        ],
        school
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });
  });

  describe("certificate validation", () => {
    beforeEach(() => {
      // Setup: Add school, fund it, and issue a certificate
      simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [Cl.principal(school), Cl.stringAscii("Test"), Cl.stringAscii("https://test.com")],
        deployer
      );
      simnet.callPublicFn(
        "certificate-manager-v1",
        "admin-fund-school",
        [Cl.principal(school), Cl.uint(10)],
        deployer
      );
      simnet.callPublicFn(
        "certificate-manager-v1",
        "issue-certificate",
        [
          Cl.principal(student),
          Cl.some(Cl.stringAscii("A+")),
          Cl.uint(1701648000),
          Cl.none(),
          Cl.stringAscii("https://test.com"),
          Cl.buffer(new Uint8Array(32).fill(1))
        ],
        school
      );
    });

    it("validates non-revoked certificate as valid", () => {
      const { result } = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "is-certificate-valid",
        [Cl.uint(1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("validates revoked certificate as invalid", () => {
      // Revoke certificate
      simnet.callPublicFn(
        "certificate-manager-v1",
        "revoke-certificate",
        [Cl.uint(1)],
        school
      );

      const { result } = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "is-certificate-valid",
        [Cl.uint(1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(false));
    });

    it("fails validation for non-existent certificate", () => {
      const { result } = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "is-certificate-valid",
        [Cl.uint(999)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR_CERTIFICATE_NOT_FOUND
    });
  });

  describe("certificate revocation", () => {
    beforeEach(() => {
      // Setup: Add school, fund it, and issue a certificate
      simnet.callPublicFn(
        "certificate-manager-v1",
        "add-school",
        [Cl.principal(school), Cl.stringAscii("Test"), Cl.stringAscii("https://test.com")],
        deployer
      );
      simnet.callPublicFn(
        "certificate-manager-v1",
        "admin-fund-school",
        [Cl.principal(school), Cl.uint(10)],
        deployer
      );
      simnet.callPublicFn(
        "certificate-manager-v1",
        "issue-certificate",
        [
          Cl.principal(student),
          Cl.some(Cl.stringAscii("A+")),
          Cl.uint(1701648000),
          Cl.none(),
          Cl.stringAscii("https://test.com"),
          Cl.buffer(new Uint8Array(32).fill(1))
        ],
        school
      );
    });

    it("allows school to revoke their certificate", () => {
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "revoke-certificate",
        [Cl.uint(1)],
        school
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify revocation
      const cert = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "get-certificate",
        [Cl.uint(1)],
        deployer
      );
      expect(cert.result).toBeSome(
        Cl.tuple({
          'school-id': Cl.principal(school),
          'student-wallet': Cl.principal(student),
          grade: Cl.some(Cl.stringAscii("A+")),
          'issue-height': Cl.uint(simnet.blockHeight - 1),
          'graduation-date': Cl.uint(1701648000),
          'expiration-height': Cl.none(),
          'metadata-url': Cl.stringAscii("https://test.com"),
          'data-hash': Cl.buffer(new Uint8Array(32).fill(1)),
          revoked: Cl.bool(true)
        })
      );
    });

    it("allows super-admin to revoke any certificate", () => {
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "revoke-certificate",
        [Cl.uint(1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("fails when unauthorized tries to revoke", () => {
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "revoke-certificate",
        [Cl.uint(1)],
        wallet3
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it("allows reactivating revoked certificate", () => {
      // First revoke
      simnet.callPublicFn(
        "certificate-manager-v1",
        "revoke-certificate",
        [Cl.uint(1)],
        school
      );

      // Then reactivate
      const { result } = simnet.callPublicFn(
        "certificate-manager-v1",
        "reactivate-certificate",
        [Cl.uint(1)],
        school
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify reactivation
      const isValid = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "is-certificate-valid",
        [Cl.uint(1)],
        deployer
      );
      expect(isValid.result).toBeOk(Cl.bool(true));
    });
  });

  describe("read-only functions", () => {
    it("returns total certificates count", () => {
      const { result } = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "get-total-certificates",
        [],
        deployer
      );
      expect(result).toBeUint(0);
    });

    it("returns stx-per-credit", () => {
      const { result } = simnet.callReadOnlyFn(
        "certificate-manager-v1",
        "get-stx-per-credit",
        [],
        deployer
      );
      expect(result).toBeUint(2000);
    });
  });
});
